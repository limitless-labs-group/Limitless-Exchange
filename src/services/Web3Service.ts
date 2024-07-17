import { useEtherspot } from '@/services/Etherspot'
import { useExternalWalletService } from '@/services/ExternalWalletService'
import { Address } from '@/types'

type Web3Service = {
  wrapEth: (value: bigint) => Promise<string>
  unwrapEth: (value: bigint) => Promise<string | undefined>
  mintErc20: (
    token: Address,
    value: bigint,
    smartWalletAddress: Address,
    newToken?: boolean
  ) => Promise<string | undefined>
  transferErc20: (token: Address, to: Address, value: bigint) => Promise<string | undefined>
  transferEthers: (to: Address, value: bigint) => Promise<string | undefined>
  buyOutcomeTokens: (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    minOutcomeTokensToBuy: bigint,
    collateralContract: Address
  ) => Promise<string | undefined>
  sellOutcomeTokens: (
    conditionalTokensAddress: Address,
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    maxOutcomeTokensToSell: bigint
  ) => Promise<string | undefined>
  client: 'etherspot' | 'eoa'
  checkAllowance: (contractAddress: Address, spender: Address) => Promise<bigint>
  checkAllowanceForAll: (contractAddress: Address, spender: Address) => Promise<boolean>
  approveContract: (
    contractAddress: Address,
    spender: Address,
    value: bigint
  ) => Promise<string | undefined>
  approveAllowanceForAll: (
    contractAddress: Address,
    spender: Address
  ) => Promise<string | undefined>
  redeemPositions: (
    conditionalTokensAddress: Address,
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address,
    indexSets: number[]
  ) => Promise<string | undefined>
}

export function useWeb3Service(): Web3Service {
  const { etherspot } = useEtherspot()
  const externalWalletService = useExternalWalletService()

  const client = etherspot ? 'etherspot' : 'eoa'

  const wrapEth = async (value: bigint) => {
    if (client === 'etherspot') {
      const receipt = await etherspot?.wrapEth(value)
      return receipt?.transactionHash || ''
    }
    return externalWalletService.wrapEth(value)
  }

  const unwrapEth = async (value: bigint) => {
    if (client === 'etherspot') {
      const receipt = await etherspot?.unwrapEth(value)
      return receipt?.transactionHash
    }
    return externalWalletService.unwrapEth(value)
  }

  const mintErc20 = async (
    token: Address,
    value: bigint,
    smartWalletAddress: Address,
    newToken?: boolean
  ) => {
    if (client === 'etherspot') {
      return etherspot?.mintErc20(token, value, smartWalletAddress, newToken)
    }
    return externalWalletService.mintErc20(token, value, smartWalletAddress, newToken)
  }

  const transferEthers = async (to: Address, value: bigint) => {
    if (client === 'etherspot') {
      return etherspot?.transferEthers(to, value)
    }
    return externalWalletService.transferEthers(to, value)
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    if (client === 'etherspot') {
      return etherspot?.transferErc20(token, to, value)
    }
    return externalWalletService.transferErc20(token, to, value)
  }

  const buyOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    minOutcomeTokensToBuy: bigint,
    collateralContract: Address
  ) => {
    if (client === 'etherspot') {
      return etherspot?.buyOutcomeTokens(
        fixedProductMarketMakerAddress,
        collateralAmount,
        outcomeIndex,
        minOutcomeTokensToBuy,
        collateralContract
      )
    }
    return externalWalletService.buyOutcomeTokens(
      fixedProductMarketMakerAddress,
      collateralAmount,
      outcomeIndex,
      minOutcomeTokensToBuy
    )
  }

  const sellOutcomeTokens = async (
    conditionalTokensAddress: Address,
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    maxOutcomeTokensToSell: bigint
  ) => {
    if (client === 'etherspot') {
      return etherspot?.sellOutcomeTokens(
        conditionalTokensAddress,
        fixedProductMarketMakerAddress,
        collateralAmount,
        outcomeIndex,
        maxOutcomeTokensToSell
      )
    }
    return externalWalletService.sellOutcomeTokens(
      fixedProductMarketMakerAddress,
      collateralAmount,
      outcomeIndex,
      maxOutcomeTokensToSell
    )
  }

  const redeemPositions = async (
    conditionalTokensAddress: Address,
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address,
    indexSets: number[]
  ) => {
    if (client === 'etherspot') {
      return etherspot?.redeemPositions(
        conditionalTokensAddress,
        collateralAddress,
        parentCollectionId,
        marketConditionId,
        indexSets
      )
    }
    return externalWalletService.redeemPositions(
      conditionalTokensAddress,
      collateralAddress,
      parentCollectionId,
      marketConditionId,
      indexSets
    )
  }

  const checkAllowance = async (contractAddress: Address, spender: Address) =>
    externalWalletService.checkAllowanceEOA(contractAddress, spender)

  const checkAllowanceForAll = async (contractAddress: Address, spender: Address) =>
    externalWalletService.checkAllowanceForAllEOA(contractAddress, spender)

  const approveContract = async (contractAddress: Address, spender: Address, value: bigint) =>
    externalWalletService.approveContractEOA(contractAddress, spender, value)

  const approveAllowanceForAll = async (contractAddress: Address, spender: Address) =>
    externalWalletService.approveContractForAllEOA(contractAddress, spender)

  return {
    wrapEth,
    mintErc20,
    transferErc20,
    unwrapEth,
    transferEthers,
    buyOutcomeTokens,
    sellOutcomeTokens,
    client,
    checkAllowance,
    checkAllowanceForAll,
    approveContract,
    approveAllowanceForAll,
    redeemPositions,
  }
}
