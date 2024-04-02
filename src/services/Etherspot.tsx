import { collateralToken, conditionalTokensAddress, defaultChain } from '@/constants'
import { conditionalTokensABI, erc20ABI, marketMakerABI } from '@/contracts'
import { publicClient, useWeb3Auth } from '@/providers'
import { Address } from '@/types'
import { EtherspotBundler, PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { TransactionReceipt, encodeFunctionData, getContract, parseEther } from 'viem'

interface IEtherspotContext {
  etherspot: Etherspot | null
  smartWalletAddress?: Address
  signMessage: (message: string) => Promise<string | undefined>
  transferErc20: (data: ITransferErc20) => Promise<TransactionReceipt | undefined>
}

const EtherspotContext = createContext<IEtherspotContext>({} as IEtherspotContext)

export const useEtherspot = () => useContext(EtherspotContext)

export const EtherspotProvider = ({ children }: PropsWithChildren) => {
  /**
   * WEB3AUTH
   */
  const { provider: web3AuthProvider, isConnected } = useWeb3Auth()

  /**
   * ETHERSPOT INSTANCE
   */
  const [etherspot, setEtherspot] = useState<Etherspot | null>(null)

  /**
   * Initialize Etherspot with Prime SDK instance on top of W3A wallet, once user signed in
   */
  const initEtherspot = useCallback(async () => {
    console.log('initEtherspot', web3AuthProvider, isConnected)
    if (!web3AuthProvider || !isConnected) {
      setEtherspot(null)
      return
    }

    const mappedProvider = new Web3WalletProvider(web3AuthProvider)
    await mappedProvider.refresh()
    const primeSdk = new PrimeSdk(mappedProvider, {
      projectKey: '',
      chainId: defaultChain.id,
      bundlerProvider: new EtherspotBundler(
        defaultChain.id,
        process.env.NEXT_PUBLIC_ETHERSPOT_API_KEY
        // 'https://basesepolia-bundler.etherspot.io/'
      ),
      // rpcProviderUrl: 'https://basesepolia-bundler.etherspot.io/',
      // entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      // walletFactoryAddress: '0xb56eC212C60C47fb7385f13b7247886FFa5E9D5C',
    })

    const etherspot = new Etherspot(
      primeSdk,
      conditionalTokensAddress[defaultChain.id],
      collateralToken.address[defaultChain.id]
    )
    setEtherspot(etherspot)
  }, [web3AuthProvider, isConnected])

  useEffect(() => {
    initEtherspot()
  }, [web3AuthProvider, isConnected])

  /**
   * Query to fetch smart wallet address
   */
  const { data: smartWalletAddress } = useQuery({
    queryKey: ['smartWalletAddress', !!etherspot, web3AuthProvider?.chainId],
    queryFn: async () => {
      const address = await etherspot?.getAddress()
      console.log(`Smart wallet address: ${smartWalletAddress}`)
      return address
    },
  })

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
      } // TODO: display error

      // paymaster whitelist
      // const isWhitelisted = await etherspot.isWhitelisted(smartWalletAddress)
      // if (!isWhitelisted) {
      //   await etherspot.whitelist(smartWalletAddress)
      // }

      onSign?.()
      const opHash = await etherspot.transferErc20(token, to, amount)
      const receipt = await etherspot.waitForTransaction(opHash)
      await onConfirm?.(receipt)
      return receipt
    },
  })

  const contextProviderValue: IEtherspotContext = {
    etherspot,
    smartWalletAddress,
    signMessage,
    transferErc20,
  }

  return (
    <EtherspotContext.Provider value={contextProviderValue}>{children}</EtherspotContext.Provider>
  )
}

interface ITransferErc20 {
  token?: Address
  to?: Address
  amount: bigint
  onSign?: () => void
  onConfirm?: (receipt: TransactionReceipt) => Promise<any>
}

class Etherspot {
  primeSdk: PrimeSdk
  conditionalTokensAddress: Address
  collateralTokenAddress: Address

  paymasterApiKey = 'arka_public_key'
  paymasterUrl = `https://arka.etherspot.io?apiKey=${this.paymasterApiKey}&chainId=${defaultChain.id}`
  isPaymasterEnabled = false

  constructor(
    _primeSdk: PrimeSdk,
    _conditionalTokensAddress: Address,
    _collateralTokenAddress: Address
  ) {
    this.primeSdk = _primeSdk
    this.conditionalTokensAddress = _conditionalTokensAddress
    this.collateralTokenAddress = _collateralTokenAddress
  }

  // TODO: incapsulate
  getMarketMakerContract(address: Address) {
    return getContract({
      address,
      abi: marketMakerABI,
      client: publicClient,
    })
  }

  // TODO: incapsulate
  getCollateralTokenContract() {
    return getContract({
      address: this.collateralTokenAddress,
      abi: erc20ABI,
      client: publicClient,
    })
  }

  // TODO: incapsulate
  getConditionalTokensContract() {
    return getContract({
      address: this.conditionalTokensAddress,
      abi: conditionalTokensABI,
      client: publicClient,
    })
  }

  async getAddress() {
    return this.primeSdk.getCounterFactualAddress() as Promise<Address>
  }

  // whitelisting for paymaster
  async whitelist(address: Address) {
    const response = await axios.post('https://arka.etherspot.io/whitelist', {
      params: [[address], defaultChain.id, this.paymasterApiKey],
    })
    console.log('WHITELIST_ADDRESS_RESPONSE: ', response)
  }

  async isWhitelisted(address: Address) {
    const sponsor = '0xaeAF09795d8C0e6fA4bB5f89dc9c15EC02021567'
    const response = await axios.post('https://arka.etherspot.io/checkWhitelist', {
      params: [sponsor, address, defaultChain.id, this.paymasterApiKey],
    })
    console.log('IS_WHITELISTED_RESPONSE: ', response)
    return response.data?.message === 'Already added'
  }

  async estimate(isSponsored = this.isPaymasterEnabled) {
    const op = await this.primeSdk.estimate({
      paymasterDetails: isSponsored
        ? {
            url: this.paymasterUrl,
            context: { mode: 'sponsor' },
          }
        : undefined,
    })
    return op
  }

  async batchAndSendUserOp(
    to: string,
    txData: string,
    isSponsored = this.isPaymasterEnabled,
    value?: bigint
  ) {
    await this.primeSdk.clearUserOpsFromBatch()
    await this.primeSdk.addUserOpsToBatch({ to, data: txData, value })
    const op = await this.estimate(isSponsored)
    const opHash = await this.primeSdk.send(op)
    return opHash
  }

  async waitForTransaction(opHash: string) {
    let opReceipt = null
    const timeout = Date.now() + 120000
    while (opReceipt == null && Date.now() < timeout) {
      await sleep(2)
      opReceipt = await this.primeSdk.getUserOpReceipt(opHash)
    }
    console.log('\x1b[33m%s\x1b[0m', `Transaction Receipt: `, opReceipt)
    return opReceipt.receipt as TransactionReceipt
  }

  async transferEthers(to: Address, value: string, isSponsored = this.isPaymasterEnabled) {
    if (isNaN(Number(value))) {
      throw Error('Invalid value input')
    }
    await this.primeSdk.clearUserOpsFromBatch()
    await this.primeSdk.addUserOpsToBatch({
      to,
      value: parseEther(value),
    })
    const op = await this.estimate(isSponsored)
    const opHash = await this.primeSdk.send(op)
    return opHash
  }

  async transferErc20(
    token: Address,
    to: Address,
    value: bigint,
    isSponsored = this.isPaymasterEnabled
  ) {
    const txData = encodeFunctionData({
      abi: erc20ABI,
      functionName: 'transfer',
      args: [to, value],
    })
    return this.batchAndSendUserOp(token, txData, isSponsored)
  }

  async mintErc20(
    token: Address,
    to: Address,
    value: bigint,
    isSponsored = this.isPaymasterEnabled
  ) {
    const txData = encodeFunctionData({
      abi: erc20ABI,
      functionName: 'mint',
      args: [to, value],
    })
    return this.batchAndSendUserOp(token, txData, isSponsored)
  }

  // TODO: incapsulate
  async approveCollateralIfNeeded(spender: Address, amount: bigint) {
    const owner = await this.getAddress()
    const allowance = (await this.getCollateralTokenContract().read.allowance([
      owner,
      spender,
    ])) as bigint
    if (allowance >= amount) {
      return
    }
    const txData = encodeFunctionData({
      abi: erc20ABI,
      functionName: 'approve',
      args: [spender, amount],
    })
    const opHash = await this.batchAndSendUserOp(this.collateralTokenAddress, txData)
    return await this.waitForTransaction(opHash)
  }

  // TODO: incapsulate
  async approveConditionalIfNeeded(spender: Address) {
    const owner = await this.getAddress()
    const isApproved = await this.getConditionalTokensContract().read.isApprovedForAll([
      owner,
      spender,
    ])
    if (!isApproved) {
      const txData = encodeFunctionData({
        abi: conditionalTokensABI,
        functionName: 'setApprovalForAll',
        args: [spender, true],
      })
      const opHash = await this.batchAndSendUserOp(this.conditionalTokensAddress, txData)
      return await this.waitForTransaction(opHash)
    }
  }

  async wrapEth(value: bigint) {
    console.log('wrapEth', value)
    const txData = encodeFunctionData({
      abi: erc20ABI,
      functionName: 'deposit',
    })
    const opHash = await this.batchAndSendUserOp(this.collateralTokenAddress, txData, false, value)
    return await this.waitForTransaction(opHash)
  }

  // TODO: incapsulate
  async buyOutcomeTokens(
    marketMakerAddress: Address,
    amount: bigint,
    outcomeToken: number,
    outcomeLength: number
  ) {
    const account = await this.getAddress()
    const outcomeTokenAmounts = Array.from({ length: outcomeLength }, (_, index) =>
      index === outcomeToken ? amount : 0n
    )
    const cost = (await this.getMarketMakerContract(marketMakerAddress).read.calcNetCost([
      outcomeTokenAmounts,
    ])) as bigint
    const collateralBalance = (await this.getCollateralTokenContract().read.balanceOf([
      account,
    ])) as bigint

    if (cost > collateralBalance) {
      throw Error('Collateral insufficient')
    }

    await this.approveCollateralIfNeeded(marketMakerAddress, cost)

    const txData = encodeFunctionData({
      abi: marketMakerABI,
      functionName: 'trade',
      args: [outcomeTokenAmounts, cost],
    })

    const opHash = await this.batchAndSendUserOp(marketMakerAddress, txData)
    return await this.waitForTransaction(opHash)
  }

  // TODO: incapsulate
  async sellOutcomeTokens(
    marketMakerAddress: Address,
    amount: bigint,
    outcomeToken: number,
    outcomeLength: number
  ) {
    const marketMakerContract = this.getMarketMakerContract(marketMakerAddress)
    // const collateralTokenContract = await this.getCollateralTokenContract()
    // const decimals = await collateralTokenContract.read.decimals()
    // const formattedAmount = parseUnits(amount, decimals)
    const outcomeTokenAmounts = Array.from({ length: outcomeLength }, (v, i) =>
      i === outcomeToken ? amount * -1n : 0n
    )

    await this.approveConditionalIfNeeded(marketMakerAddress)

    const profit =
      ((await marketMakerContract.read.calcNetCost([outcomeTokenAmounts])) as bigint) * -1n

    const txData = encodeFunctionData({
      abi: marketMakerABI,
      functionName: 'trade',
      args: [outcomeTokenAmounts, profit],
    })

    const opHash = await this.batchAndSendUserOp(marketMakerAddress, txData)
    return await this.waitForTransaction(opHash)
  }

  // TODO: incapsulate
  async redeemPositions(
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address,
    indexSets: bigint[]
  ) {
    const txData = encodeFunctionData({
      abi: conditionalTokensABI,
      functionName: 'redeemPositions',
      args: [collateralAddress, parentCollectionId, marketConditionId, indexSets],
    })
    return this.batchAndSendUserOp(this.conditionalTokensAddress, txData)
  }
}
