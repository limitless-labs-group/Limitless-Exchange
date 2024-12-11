import { usePrivy } from '@privy-io/react-auth'
import { Address, encodeFunctionData, getContract, maxUint256 } from 'viem'
import { conditionalTokensABI, fixedProductMarketMakerABI, wethABI } from '@/contracts'
import { erc20Abi } from '@/contracts/generated'
import { publicClient } from '@/providers/Privy'
import { useAccount, useLimitlessApi } from '@/services'

export default function usePrivySendTransaction() {
  const { account } = useAccount()
  const { supportedTokens } = useLimitlessApi()
  const { sendTransaction } = usePrivy()

  const wethToken = supportedTokens?.find((token) => token.name == 'weth')

  const approveCollateralIfNeeded = async (
    spender: Address,
    amount: bigint,
    collateralContract: Address
  ) => {
    const contract = getContract({
      address: collateralContract,
      abi: erc20Abi,
      client: publicClient,
    })
    const allowance = (await contract.read.allowance([account as Address, spender])) as bigint
    if (allowance < amount) {
      const data = encodeFunctionData({
        abi: spender.toLowerCase() === wethToken?.address.toLowerCase() ? wethABI : erc20Abi,
        functionName: 'approve',
        args: [spender, maxUint256],
      })
      const { transactionHash } = await sendTransaction({
        from: account,
        to: contract.address,
        data,
      })
      return transactionHash
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

    const data = encodeFunctionData({
      abi: fixedProductMarketMakerABI,
      functionName: 'buy',
      args: [collateralAmount, outcomeIndex, minOutcomeTokensToBuy],
    })

    const { transactionHash } = await sendTransaction({
      data,
      from: account,
      to: fixedProductMarketMakerAddress,
    })
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
      const { transactionHash } = await sendTransaction({
        data,
        from: account,
        to: conditionalTokensAddress,
      })
      return transactionHash
    }
  }

  const wrapEth = async (value: bigint) => {
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'deposit',
    })

    const { transactionHash } = await sendTransaction({
      data,
      from: account,
      to: wethToken?.address,
      value,
    })
    return transactionHash
  }

  const unwrapEth = async (value: bigint) => {
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'withdraw',
      args: [value],
    })
    const { transactionHash } = await sendTransaction({
      data,
      from: account,
      to: wethToken?.address,
    })
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

    const data = encodeFunctionData({
      abi: fixedProductMarketMakerABI,
      functionName: 'sell',
      args: [collateralAmount, outcomeIndex, maxOutcomeTokensToSell],
    })

    const { transactionHash } = await sendTransaction({
      data,
      from: account,
      to: fixedProductMarketMakerAddress,
    })
    return transactionHash
  }

  const redeemPositions = async (
    conditionalTokensAddress: Address,
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address,
    indexSets: number[]
  ) => {
    const data = encodeFunctionData({
      abi: conditionalTokensABI,
      functionName: 'redeemPositions',
      args: [collateralAddress, parentCollectionId, marketConditionId, indexSets],
    })
    const { transactionHash } = await sendTransaction({
      data,
      from: account,
      to: conditionalTokensAddress,
    })
    return transactionHash
  }

  const transferEthers = async (to: Address, value: bigint) => {
    const { transactionHash } = await sendTransaction({
      from: account,
      to,
      value,
    })
    return transactionHash
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, value],
    })
    const { transactionHash } = await sendTransaction({
      data,
      from: account,
      to: token,
    })
    return transactionHash
  }

  return {
    buyOutcomeTokens,
    wrapEth,
    unwrapEth,
    sellOutcomeTokens,
    redeemPositions,
    transferEthers,
    transferErc20,
  }
}
