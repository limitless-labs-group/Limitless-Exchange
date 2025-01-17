import { usePrivy } from '@privy-io/react-auth'
import { getWalletClient } from '@wagmi/core'
import { Address, encodeFunctionData, erc20Abi, getContract } from 'viem'
import { useAccount as useWagmiAccount } from 'wagmi'
import { defaultChain } from '@/constants'
import { conditionalTokensABI, fixedProductMarketMakerABI, wethABI } from '@/contracts'
import { configureChainsConfig, publicClient } from '@/providers/Privy'
import { useAccount } from '@/services/AccountService'
import { useLimitlessApi } from '@/services/LimitlessApi'

export const useExternalWalletService = () => {
  const { account } = useAccount()
  const { supportedTokens } = useLimitlessApi()
  const { chainId } = useWagmiAccount()
  const { user } = usePrivy()

  const collateralTokenAddress = supportedTokens ? supportedTokens[0].address : '0x'

  const wrapEth = async (value: bigint) => {
    await checkAndSwitchChainIfNeeded()
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'deposit',
    })
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    const receipt = await client.sendTransaction({
      to: collateralTokenAddress,
      data,
      value,
    })
    return receipt as string
  }

  const unwrapEth = async (value: bigint) => {
    await checkAndSwitchChainIfNeeded()
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'withdraw',
      args: [value],
    })
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    const receipt = await client.sendTransaction({
      to: collateralTokenAddress,
      data,
    })
    return receipt
  }

  const checkAllowanceEOA = async (spender: Address, contractAddress: Address): Promise<bigint> => {
    const contract = getContract({
      address: contractAddress,
      abi: erc20Abi,
      client: publicClient,
    })
    return await contract.read.allowance([account as Address, spender])
  }

  const checkAllowanceForAllEOA = async (spender: Address, contractAddress: Address) => {
    const contract = getContract({
      address: contractAddress,
      abi: conditionalTokensABI,
      client: publicClient,
    })
    const isApprovedForAll = await contract.read.isApprovedForAll([account as Address, spender])
    return isApprovedForAll as boolean
  }

  const approveContractEOA = async (
    spender: Address,
    contractAddress: Address,
    value: bigint
  ): Promise<string> => {
    console.log('approveContractEOA')
    await checkAndSwitchChainIfNeeded()
    console.log('checked chain switched')
    const data = encodeFunctionData({
      abi: spender === collateralTokenAddress ? wethABI : erc20Abi,
      args: [spender, value],
      functionName: 'approve',
    })
    console.log(data)
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    console.log(client)
    const receipt = await client.sendTransaction({
      to: contractAddress,
      data,
    })
    return receipt as string
  }

  const approveContractForAllEOA = async (spender: Address, contractAddress: Address) => {
    await checkAndSwitchChainIfNeeded()
    const data = encodeFunctionData({
      abi: conditionalTokensABI,
      functionName: 'setApprovalForAll',
      args: [spender, true],
    })
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    const receipt = await client.sendTransaction({
      to: contractAddress,
      data,
    })
    return receipt
  }

  const transferEthers = async (to: Address, value: bigint) => {
    await checkAndSwitchChainIfNeeded()
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    const receipt = await client.sendTransaction({
      to,
      value,
    })
    return receipt
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    await checkAndSwitchChainIfNeeded()
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'transfer',
      args: [to, value],
    })
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    const receipt = await client.sendTransaction({
      to: token,
      data,
    })
    return receipt
  }

  const buyOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    minOutcomeTokensToBuy: bigint
  ) => {
    await checkAndSwitchChainIfNeeded()
    const data = encodeFunctionData({
      abi: fixedProductMarketMakerABI,
      functionName: 'buy',
      args: [collateralAmount, outcomeIndex, minOutcomeTokensToBuy],
    })
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    const receipt = await client.sendTransaction({
      to: fixedProductMarketMakerAddress,
      data,
    })
    return receipt
  }

  const sellOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    maxOutcomeTokensToSell: bigint
  ) => {
    await checkAndSwitchChainIfNeeded()
    const data = encodeFunctionData({
      abi: fixedProductMarketMakerABI,
      functionName: 'sell',
      args: [collateralAmount, outcomeIndex, maxOutcomeTokensToSell],
    })
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    const receipt = await client.sendTransaction({
      to: fixedProductMarketMakerAddress,
      data,
    })
    return receipt
  }

  const redeemPositions = async (
    conditionalTokensAddress: Address,
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address,
    indexSets: number[]
  ) => {
    await checkAndSwitchChainIfNeeded()
    const data = encodeFunctionData({
      abi: conditionalTokensABI,
      functionName: 'redeemPositions',
      args: [collateralAddress, parentCollectionId, marketConditionId, indexSets],
    })
    const client = await getWalletClient(configureChainsConfig, {
      account: user?.wallet?.address as Address,
    })
    const receipt = await client.sendTransaction({
      to: conditionalTokensAddress,
      data,
    })
    return receipt
  }

  const checkAndSwitchChainIfNeeded = async () => {
    console.log(chainId)
    console.log(defaultChain.id)
    if (chainId !== defaultChain.id) {
      const client = await getWalletClient(configureChainsConfig, {
        account: user?.wallet?.address as Address,
      })
      console.log(client)
      await client.switchChain({
        id: defaultChain.id,
      })
    }
  }

  const checkLumyAccountBalance = async () => {
    const contract = getContract({
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      abi: erc20Abi,
      client: publicClient,
    })
    return contract.read.balanceOf(['0x6bb3d8A69656d1865708242223190a29D3a7E3c7'])
  }

  return {
    wrapEth,
    unwrapEth,
    transferErc20,
    transferEthers,
    buyOutcomeTokens,
    sellOutcomeTokens,
    checkAllowanceEOA,
    checkAllowanceForAllEOA,
    approveContractEOA,
    approveContractForAllEOA,
    redeemPositions,
    checkLumyAccountBalance,
  }
}
