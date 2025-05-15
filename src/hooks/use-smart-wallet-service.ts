import { ERC20_ABI } from '@lifi/sdk'
import { Address, encodeFunctionData, getContract, maxUint256 } from 'viem'
import { defaultChain } from '@/constants'
import { conditionalTokensABI, fixedProductMarketMakerABI, wethABI } from '@/contracts'
import { ERC20ABI } from '@/contracts/abi/ERC20ABI'
import { negriskAdapterAbi } from '@/contracts/abi/NegriskAdapterAbi'
import { publicClient } from '@/providers/Privy'
import { useAccount, useLimitlessApi } from '@/services'

export default function useSmartWalletService() {
  const { account } = useAccount()
  const { supportedTokens } = useLimitlessApi()
  const { smartAccountClient } = useAccount()

  const wethToken = supportedTokens?.find((token) => token.name == 'weth')

  const transferEthers = async (to: Address, value: bigint) => {
    const txHash = await smartAccountClient?.sendTransaction({
      account: smartAccountClient.account?.address as Address,
      chain: defaultChain,
      to,
      value,
    })
    return txHash as string
  }

  const sendTransaction = async (
    contract: Record<string, unknown>,
    data: `0x${string}`,
    value?: bigint
  ) => {
    const nonce = await smartAccountClient?.account?.getNonce()
    const txHash = await smartAccountClient?.sendTransaction({
      // @ts-ignore
      from: smartAccountClient.account?.address,
      to: contract.address as Address,
      data,
      value,
      nonce: nonce ? +nonce.toString() : undefined,
    })
    return txHash as string
  }

  const approveCollateralIfNeeded = async (
    spender: Address,
    amount: bigint,
    collateralContract: Address
  ) => {
    const contract = getContract({
      address: collateralContract,
      abi: ERC20_ABI,
      client: publicClient,
    })
    const allowance = (await contract.read.allowance([account as Address, spender])) as bigint
    if (allowance < amount) {
      const data = encodeFunctionData({
        abi: spender.toLowerCase() === wethToken?.address.toLowerCase() ? wethABI : ERC20_ABI,
        functionName: 'approve',
        args: [spender, maxUint256],
      })
      const hash = await sendTransaction(contract, data)
      return hash
    }
  }

  const buyOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    minOutcomeTokensToBuy: bigint,
    collateralContract: Address
  ) => {
    await approveCollateralIfNeeded(
      fixedProductMarketMakerAddress,
      collateralAmount,
      collateralContract
    )

    const contract = getContract({
      address: fixedProductMarketMakerAddress,
      abi: fixedProductMarketMakerABI,
      client: publicClient,
    })

    const data = encodeFunctionData({
      abi: fixedProductMarketMakerABI,
      functionName: 'buy',
      args: [collateralAmount, outcomeIndex, minOutcomeTokensToBuy],
    })

    const transactionHash = await sendTransaction(contract, data)
    return transactionHash
  }

  const approveConditionalIfNeeded = async (
    spender: Address,
    conditionalTokensAddress: Address
  ) => {
    const contract = getContract({
      address: conditionalTokensAddress,
      abi: conditionalTokensABI,
      client: publicClient,
    })
    const isApproved = await contract.read.isApprovedForAll([account, spender])
    if (!isApproved) {
      const data = encodeFunctionData({
        abi: conditionalTokensABI,
        functionName: 'setApprovalForAll',
        args: [spender, true],
      })
      const transactionHash = await sendTransaction(contract, data)
      return transactionHash
    }
  }

  const wrapEth = async (value: bigint) => {
    const contract = getContract({
      address: wethToken?.address as Address,
      abi: wethABI,
      client: publicClient,
    })
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'deposit',
    })

    const transactionHash = await sendTransaction(contract, data, value)
    return transactionHash
  }

  const unwrapEth = async (value: bigint) => {
    const contract = getContract({
      address: wethToken?.address as Address,
      abi: wethABI,
      client: publicClient,
    })
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'withdraw',
      args: [value],
    })
    const transactionHash = await sendTransaction(contract, data)
    return transactionHash
  }

  const sellOutcomeTokens = async (
    conditionalTokensAddress: Address,
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    maxOutcomeTokensToSell: bigint
  ) => {
    await approveConditionalIfNeeded(fixedProductMarketMakerAddress, conditionalTokensAddress)

    const contract = getContract({
      address: fixedProductMarketMakerAddress,
      abi: fixedProductMarketMakerABI,
      client: publicClient,
    })

    const data = encodeFunctionData({
      abi: fixedProductMarketMakerABI,
      functionName: 'sell',
      args: [collateralAmount, outcomeIndex, maxOutcomeTokensToSell],
    })

    const transactionHash = await sendTransaction(contract, data)
    return transactionHash
  }

  const redeemPositions = async (
    conditionalTokensAddress: Address,
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address
  ) => {
    const contract = getContract({
      address: conditionalTokensAddress,
      abi: conditionalTokensABI,
      client: publicClient,
    })
    const data = encodeFunctionData({
      abi: conditionalTokensABI,
      functionName: 'redeemPositions',
      args: [collateralAddress, parentCollectionId, marketConditionId, [1, 2]],
    })
    const transactionHash = await sendTransaction(contract, data)
    return transactionHash
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    const contract = getContract({
      address: token,
      abi: ERC20ABI,
      client: publicClient,
    })
    const data = encodeFunctionData({
      abi: ERC20ABI,
      functionName: 'transfer',
      args: [to, value],
    })
    const transactionHash = await sendTransaction(contract, data)
    return transactionHash
  }

  const splitPositions = async (
    collateralAddress: Address,
    conditionId: string,
    amount: bigint,
    type: 'common' | 'negrisk'
  ) => {
    const contractAddress =
      type === 'common'
        ? process.env.NEXT_PUBLIC_CTF_CONTRACT
        : process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
    const abi = type === 'common' ? conditionalTokensABI : negriskAdapterAbi
    await approveCollateralIfNeeded(
      contractAddress as Address,
      maxUint256,
      collateralAddress as Address
    )
    const contract = getContract({
      address: contractAddress as Address,
      abi,
      client: publicClient,
    })
    const data = encodeFunctionData({
      abi,
      functionName: 'splitPosition',
      args: [
        collateralAddress,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        conditionId,
        [1, 2],
        amount,
      ],
    })
    const transactionHash = await sendTransaction(contract, data)
    return transactionHash
  }

  const mergePositions = async (
    collateralToken: Address,
    conditionId: string,
    amount: bigint,
    type: 'common' | 'negrisk'
  ) => {
    const operator =
      type === 'common'
        ? process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR
        : process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
    await approveConditionalIfNeeded(
      operator as Address,
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
    )
    const contractAddress =
      type === 'common'
        ? process.env.NEXT_PUBLIC_CTF_CONTRACT
        : process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
    const abi = type === 'common' ? conditionalTokensABI : negriskAdapterAbi
    const contract = getContract({
      address: contractAddress as Address,
      abi,
      client: publicClient,
    })
    const data = encodeFunctionData({
      abi,
      functionName: 'mergePositions',
      args: [
        collateralToken,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        conditionId,
        [1, 2],
        amount,
      ],
    })
    const transactionHash = await sendTransaction(contract, data)
    return transactionHash
  }

  const convertShares = async (negRiskRequestId: string, indexSet: string, amount: bigint) => {
    try {
      await approveConditionalIfNeeded(
        process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
      )
      const data = encodeFunctionData({
        abi: negriskAdapterAbi,
        functionName: 'convertPositions',
        args: [negRiskRequestId, indexSet, amount],
      })
      const contract = getContract({
        address: process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
        abi: negriskAdapterAbi,
        client: publicClient,
      })
      const transactionHash = await sendTransaction(contract, data)
      return transactionHash
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const redeemNegRiskMarket = async (conditionId: string, amounts: bigint[]) => {
    await approveConditionalIfNeeded(
      process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
    )
    try {
      const data = encodeFunctionData({
        abi: negriskAdapterAbi,
        functionName: 'redeemPositions',
        args: [conditionId, amounts],
      })
      const contract = getContract({
        address: process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
        abi: negriskAdapterAbi,
        client: publicClient,
      })
      const transactionHash = await sendTransaction(contract, data)
      return transactionHash
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  return {
    buyOutcomeTokens,
    wrapEth,
    unwrapEth,
    sellOutcomeTokens,
    redeemPositions,
    transferEthers,
    transferErc20,
    sendTransaction,
    splitPositions,
    mergePositions,
    approveCollateralIfNeeded,
    approveConditionalIfNeeded,
    convertShares,
    redeemNegRiskMarket,
  }
}
