import { defaultChain } from '@/constants'
import { conditionalTokensABI, wethABI, fixedProductMarketMakerABI } from '@/contracts'
import { useWeb3Auth } from '@/providers'
import { Address, Token } from '@/types'
import { ArkaPaymaster, EtherspotBundler, PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { TransactionReceipt, encodeFunctionData, getContract, maxUint256, erc20Abi } from 'viem'
import { contractABI } from '@/contracts/utils'
import { publicClient } from '@/providers'
import { useLimitlessApi } from '@/services/LimitlessApi'

interface IEtherspotContext {
  etherspot: Etherspot | null
  smartWalletAddress?: Address
  signMessage: (message: string) => Promise<string | undefined>
  whitelist: () => Promise<void>
  transferErc20: (data: ITransferErc20) => Promise<TransactionReceipt | undefined>
}

const EtherspotContext = createContext<IEtherspotContext>({} as IEtherspotContext)

export const useEtherspot = () => useContext(EtherspotContext)

export const EtherspotProvider = ({ children }: PropsWithChildren) => {
  /**
   * WEB3AUTH
   */
  const { provider: web3AuthProvider, isConnected, web3Auth } = useWeb3Auth()

  const { supportedTokens } = useLimitlessApi()

  /**
   * ETHERSPOT INSTANCE
   */
  const [etherspot, setEtherspot] = useState<Etherspot | null>(null)

  /**
   * Initialize Etherspot with Prime SDK instance on top of W3A wallet, once user signed in
   */
  const initEtherspot = useCallback(async () => {
    if (
      !web3AuthProvider ||
      !isConnected ||
      web3Auth.connectedAdapterName !== 'openlogin' ||
      !supportedTokens
    ) {
      setEtherspot(null)
      return
    }

    const mappedProvider = new Web3WalletProvider(web3AuthProvider)
    await mappedProvider.refresh()
    const primeSdk = new PrimeSdk(mappedProvider, {
      chainId: defaultChain.id,
      bundlerProvider: new EtherspotBundler(
        defaultChain.id,
        process.env.NEXT_PUBLIC_ETHERSPOT_API_KEY
      ),
    })

    const etherspot = new Etherspot(primeSdk, supportedTokens[0].address, supportedTokens)
    setEtherspot(etherspot)
  }, [web3AuthProvider, isConnected, web3Auth.connectedAdapterName])

  useEffect(() => {
    initEtherspot()
  }, [web3AuthProvider, isConnected, web3Auth.connectedAdapterName])

  /**
   * Query to fetch smart wallet address
   */
  const { data: smartWalletAddress } = useQuery({
    queryKey: ['smartWalletAddress', !!etherspot],
    queryFn: async () => {
      const address = await etherspot?.getAddress()
      return address
    },
    enabled: !!etherspot,
    refetchOnWindowFocus: false,
  })

  /**
   * Whitelisting for paymaster
   */
  const { mutateAsync: whitelist } = useMutation({
    mutationFn: async () => {
      if (!etherspot) {
        return
      }
      const address = await etherspot.getAddress()
      const isWhitelisted = await etherspot.isWhitelisted(address)
      if (!isWhitelisted) {
        await etherspot.whitelist(address)
      }
    },
  })
  // useEffect(() => {
  //   whitelist() // TODO: whitelist when user wants to trade / deposit funds
  // }, [etherspot])

  /**
   * Mutation to sign auth message
   */
  const { mutateAsync: signMessage, data: signature } = useMutation({
    mutationFn: async (message: string) => etherspot?.primeSdk.signMessage({ message }),
  })

  /**
   * Mutation to transfer ERC20 from smart wallet to given address
   */
  const { mutateAsync: transferErc20 } = useMutation({
    mutationFn: async ({ token, to, amount, onSign, onConfirm }: ITransferErc20) => {
      if (!etherspot || !token || !to || !smartWalletAddress || amount === 0n) {
        return
      }

      onSign?.()
      const opHash = await etherspot.transferErc20(token, to, amount)
      const receipt = await etherspot.waitForTransaction(opHash)
      if (!!receipt) {
        await onConfirm?.(receipt)
      }
      return receipt
    },
  })

  const contextProviderValue: IEtherspotContext = {
    etherspot,
    smartWalletAddress,
    signMessage,
    transferErc20,
    whitelist,
  }

  return (
    <EtherspotContext.Provider value={contextProviderValue}>{children}</EtherspotContext.Provider>
  )
}

class Etherspot {
  primeSdk: PrimeSdk
  collateralTokenAddress: Address
  supportedTokens: Token[]

  paymasterApiKey = process.env.NEXT_PUBLIC_ETHERSPOT_API_KEY ?? ''
  paymasterUrl = `https://arka.etherspot.io`
  paymaster = new ArkaPaymaster(defaultChain.id, this.paymasterApiKey, this.paymasterUrl)
  isEnabledPaymaster = !defaultChain.testnet

  constructor(_primeSdk: PrimeSdk, _collateralTokenAddress: Address, _supportedTokens: Token[]) {
    this.primeSdk = _primeSdk
    this.collateralTokenAddress = _collateralTokenAddress
    this.supportedTokens = _supportedTokens
  }

  // TODO: incapsulate
  getFixedProductMarketMakerContract(address: Address) {
    return getContract({
      address,
      abi: fixedProductMarketMakerABI,
      client: publicClient,
    })
  }

  async getAddress() {
    return this.primeSdk.getCounterFactualAddress() as Promise<Address>
  }

  async whitelist(address: Address) {
    return this.paymaster.addWhitelist([address])
  }

  async isWhitelisted(address: Address) {
    const response = await this.paymaster.checkWhitelist(address)
    return response === 'Already added'
  }

  async batchAndSendUserOp(to: string, data: string, value: bigint | undefined = undefined) {
    try {
      await this.primeSdk.clearUserOpsFromBatch()
      await this.primeSdk.addUserOpsToBatch({ to, data, value })
      const op = await this.estimate()
      const opHash = await this.primeSdk.send(op)
      let result = null
      while (!result) {
        await sleep(1)
        const hash = await this.primeSdk.getUserOpReceipt(opHash)
        result = hash ? hash.receipt.transactionHash : null
      }
      return result
    } catch (e: any) {
      console.log(e)
    }
  }

  async estimate() {
    const op = await this.primeSdk.estimate({
      paymasterDetails: this.isEnabledPaymaster
        ? {
            url: `${this.paymasterUrl}?apiKey=${this.paymasterApiKey}&chainId=${defaultChain.id}`,
            context: { mode: 'sponsor' },
          }
        : undefined,
    })
    return op
  }

  async waitForTransaction(opHash: string | undefined) {
    if (!opHash) {
      return
    }
    let opReceipt = null
    const timeout = Date.now() + 60 * 3 * 1000
    while (opReceipt == null && Date.now() < timeout) {
      await sleep(2)
      opReceipt = await this.primeSdk.getUserOpReceipt(opHash)
    }
    return opReceipt.receipt as TransactionReceipt
  }

  async transferEthers(to: Address, value: bigint) {
    await this.primeSdk.clearUserOpsFromBatch()
    await this.primeSdk.addUserOpsToBatch({ to, value })
    const op = await this.estimate()
    const opHash = await this.primeSdk.send(op)
    const transactionReceipt = await this.waitForTransaction(opHash)
    return transactionReceipt?.transactionHash
  }

  async transferErc20(token: Address, to: Address, value: bigint) {
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, value],
    })
    return this.batchAndSendUserOp(token, data)
  }

  async mintErc20(token: Address, value: bigint, smartWalletAddress: Address, newToken?: boolean) {
    const args = newToken ? [smartWalletAddress, value] : [value]
    try {
      const data = encodeFunctionData({
        abi: newToken ? contractABI[defaultChain.id] : wethABI,
        functionName: 'mint',
        args,
      })
      return this.batchAndSendUserOp(token, data)
    } catch (e) {
      console.log(e)
    }
  }

  // TODO: incapsulate
  async approveCollateralIfNeeded(spender: Address, amount: bigint, collateralContract: Address) {
    const owner = await this.getAddress()
    const contract = getContract({
      address: collateralContract,
      abi: erc20Abi,
      client: publicClient,
    })
    const allowance = (await contract.read.allowance([owner, spender])) as bigint
    if (allowance < amount) {
      const data = encodeFunctionData({
        abi: spender === this.supportedTokens[0].address ? wethABI : erc20Abi,
        functionName: 'approve',
        args: [spender, maxUint256],
      })
      const opHash = await this.batchAndSendUserOp(collateralContract, data)
      const transactionReceipt = await this.waitForTransaction(opHash)
      return transactionReceipt
    }
  }

  // TODO: incapsulate
  async approveConditionalIfNeeded(spender: Address, conditionalTokensAddress: Address) {
    const owner = await this.getAddress()
    const contract = getContract({
      address: conditionalTokensAddress,
      abi: conditionalTokensABI,
      client: publicClient,
    })
    const isApproved = await contract.read.isApprovedForAll([owner, spender])
    if (!isApproved) {
      const data = encodeFunctionData({
        abi: conditionalTokensABI,
        functionName: 'setApprovalForAll',
        args: [spender, true],
      })
      const opHash = await this.batchAndSendUserOp(conditionalTokensAddress, data)
      const transactionReceipt = await this.waitForTransaction(opHash)
      return transactionReceipt
    }
  }

  // TODO: incapsulate
  async wrapEth(value: bigint) {
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'deposit',
    })

    const opHash = await this.batchAndSendUserOp(this.collateralTokenAddress, data, value)
    const transactionReceipt = await this.waitForTransaction(opHash)
    return transactionReceipt
  }

  // TODO: incapsulate
  async unwrapEth(value: bigint) {
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'withdraw',
      args: [value],
    })
    const opHash = await this.batchAndSendUserOp(this.collateralTokenAddress, data)
    const transactionReceipt = await this.waitForTransaction(opHash)
    return transactionReceipt
  }

  // TODO: incapsulate
  async buyOutcomeTokens(
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    minOutcomeTokensToBuy: bigint,
    collateralContract: Address
  ) {
    await this.approveCollateralIfNeeded(
      fixedProductMarketMakerAddress,
      collateralAmount,
      collateralContract
    )

    const data = encodeFunctionData({
      abi: fixedProductMarketMakerABI,
      functionName: 'buy',
      args: [collateralAmount, outcomeIndex, minOutcomeTokensToBuy],
    })

    const opHash = await this.batchAndSendUserOp(fixedProductMarketMakerAddress, data)
    const transactionReceipt = await this.waitForTransaction(opHash)
    return transactionReceipt?.transactionHash
  }

  // TODO: incapsulate
  async sellOutcomeTokens(
    conditionalTokensAddress: Address,
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    maxOutcomeTokensToSell: bigint
  ) {
    await this.approveConditionalIfNeeded(fixedProductMarketMakerAddress, conditionalTokensAddress)

    const data = encodeFunctionData({
      abi: fixedProductMarketMakerABI,
      functionName: 'sell',
      args: [collateralAmount, outcomeIndex, maxOutcomeTokensToSell],
    })

    const opHash = await this.batchAndSendUserOp(fixedProductMarketMakerAddress, data)
    const transactionReceipt = await this.waitForTransaction(opHash)
    return transactionReceipt?.transactionHash
  }

  // TODO: incapsulate
  async redeemPositions(
    conditionalTokensAddress: Address,
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address,
    indexSets: number[]
  ) {
    const data = encodeFunctionData({
      abi: conditionalTokensABI,
      functionName: 'redeemPositions',
      args: [collateralAddress, parentCollectionId, marketConditionId, indexSets],
    })
    const opHash = await this.batchAndSendUserOp(conditionalTokensAddress, data)
    const transactionReceipt = await this.waitForTransaction(opHash)
    return transactionReceipt?.transactionHash
  }
}

interface ITransferErc20 {
  token?: Address
  to?: Address
  amount: bigint
  onSign?: () => void
  onConfirm?: (receipt: TransactionReceipt | undefined) => Promise<any>
}
