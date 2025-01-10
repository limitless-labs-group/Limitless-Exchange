import { Address, encodeFunctionData, getContract, maxUint256 } from 'viem'
import { defaultChain } from '@/constants'
import { conditionalTokensABI, fixedProductMarketMakerABI, wethABI } from '@/contracts'
import { erc20Abi } from '@/contracts/generated'
import { publicClient } from '@/providers/Privy'
import { useAccount, useLimitlessApi } from '@/services'

export default function usePrivySendTransaction() {
  const { account } = useAccount()
  const { supportedTokens } = useLimitlessApi()
  const { smartAccountClient } = useAccount()

  const wethToken = supportedTokens?.find((token) => token.name == 'weth')

  const transferEthers = async (to: Address, value: bigint) => {
    const nonce = await smartAccountClient?.account?.getNonce()
    const txHash = await smartAccountClient?.sendTransaction({
      account: smartAccountClient.account?.address as Address,
      chain: defaultChain,
      to,
      value,
      nonce: nonce ? Number(nonce) : undefined,
    })
    return txHash as string
  }

  const sendTransaction = async (
    contract: Record<string, unknown>,
    data: `0x${string}`,
    value?: bigint
  ) => {
    // const contract = getContract({
    //   address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    //   abi: erc20Abi,
    //   client: bundlerClient,
    // })
    // const data = encodeFunctionData({
    //   abi: erc20Abi,
    //   functionName: 'approve',
    //   args: ['0xf5cF421Fba306BbAb8005262755D0c94758FdFb5', maxUint256],
    // })
    // const allowance = await contract.read.allowance([smartAccountClient.account?.address as Address, '0xf5cF421Fba306BbAb8005262755D0c94758FdFb5'])
    // console.log(allowance)
    const nonce = await smartAccountClient?.account?.getNonce()
    // const operation = await smartAccountClient.prepareUserOperationRequest({
    //     userOperation: {
    //         callData: data,
    //     },
    //     account: smartAccountClient.account
    // })
    //
    // console.log(operation)

    const txHash = await smartAccountClient?.sendTransaction({
      // @ts-ignore
      // account: smartAccountClient.account,
      // to: zeroAddress,
      // data: "0x",
      // value: BigInt(0)
      from: smartAccountClient.account?.address,
      to: contract.address as Address,
      data,
      value,
      nonce: nonce ? Number(nonce) : undefined,
    })
    return txHash as string
    // const preHash = await bundlerClient.getUserOperationByHash({
    //   hash: '0x8c37e409316fb6e7a6f3bc999e1af1798414c16915583bbddb9a4dcd31a14c2e'
    // })
    // console.log(preHash)
    // const anotherHash = await bundlerClient.getUserOperationReceipt({
    //   hash: '0x8c37e409316fb6e7a6f3bc999e1af1798414c16915583bbddb9a4dcd31a14c2e'
    // })
    // console.log(anotherHash)
    // // const thirdHash = await bundlerClient.sendUserOperation({
    // //     userOperation: {
    // //         sender: smartAccountClient.account as  any,
    // //         callData: data,
    // //         nonce: BigInt(nonce ? nonce: 1)
    // //     }
    // // })
    // const finalHash = await bundlerClient.waitForUserOperationReceipt({
    //   hash: txHash,
    //   timeout: 20000000
    // })
    // console.log(finalHash)
    // onSendTransaction(txHash)
    // setLoading(false)
  }

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
    marketConditionId: Address,
    indexSets: number[]
  ) => {
    const contract = getContract({
      address: conditionalTokensAddress,
      abi: conditionalTokensABI,
      client: publicClient,
    })
    const data = encodeFunctionData({
      abi: conditionalTokensABI,
      functionName: 'redeemPositions',
      args: [collateralAddress, parentCollectionId, marketConditionId, indexSets],
    })
    const transactionHash = await sendTransaction(contract, data)
    return transactionHash
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    const contract = getContract({
      address: token,
      abi: erc20Abi,
      client: publicClient,
    })
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, value],
    })
    const transactionHash = await sendTransaction(contract, data)
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
