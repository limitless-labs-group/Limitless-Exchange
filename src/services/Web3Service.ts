import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import usePrivySendTransaction from '@/hooks/use-privy-send-transaction'
import { useAccount } from '@/services/AccountService'
import { useExternalWalletService } from '@/services/ExternalWalletService'
import { Address } from '@/types'

type Web3Service = {
  wrapEth: (value: bigint) => Promise<string>
  unwrapEth: (value: bigint) => Promise<string | undefined>
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
  const externalWalletService = useExternalWalletService()
  const privyService = usePrivySendTransaction()
  const { setActiveWallet } = useSetActiveWallet()
  const { wallets } = useWallets()
  const { user } = usePrivy()

  const { web3Client } = useAccount()

  const getAndSetActiveWallet = async () => {
    const connectedWallet = wallets.find(
      (wallet) => wallet.connectorType === user?.wallet?.connectorType
    )
    if (connectedWallet) {
      console.log(connectedWallet)
      await setActiveWallet(connectedWallet)
    }
  }

  const wrapEth = async (value: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.wrapEth(value)
    }
    await getAndSetActiveWallet()
    return externalWalletService.wrapEth(value)
  }

  const unwrapEth = async (value: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.unwrapEth(value)
    }
    await getAndSetActiveWallet()
    return externalWalletService.unwrapEth(value)
  }

  const transferEthers = async (to: Address, value: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.transferEthers(to, value)
    }
    await getAndSetActiveWallet()
    return externalWalletService.transferEthers(to, value)
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.transferErc20(token, to, value)
    }
    await getAndSetActiveWallet()
    return externalWalletService.transferErc20(token, to, value)
  }

  const buyOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    minOutcomeTokensToBuy: bigint,
    collateralContract: Address
  ) => {
    if (web3Client === 'etherspot') {
      return privyService.buyOutcomeTokens(
        fixedProductMarketMakerAddress,
        collateralAmount,
        outcomeIndex,
        minOutcomeTokensToBuy,
        collateralContract
      )
    }
    await getAndSetActiveWallet()
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
    if (web3Client === 'etherspot') {
      return privyService.sellOutcomeTokens(
        conditionalTokensAddress,
        fixedProductMarketMakerAddress,
        collateralAmount,
        outcomeIndex,
        maxOutcomeTokensToSell
      )
    }
    await getAndSetActiveWallet()
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
    if (web3Client === 'etherspot') {
      return privyService.redeemPositions(
        conditionalTokensAddress,
        collateralAddress,
        parentCollectionId,
        marketConditionId,
        indexSets
      )
    }
    await getAndSetActiveWallet()
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

  const approveContract = async (contractAddress: Address, spender: Address, value: bigint) => {
    await getAndSetActiveWallet()
    return externalWalletService.approveContractEOA(contractAddress, spender, value)
  }

  const approveAllowanceForAll = async (contractAddress: Address, spender: Address) => {
    await getAndSetActiveWallet()
    return externalWalletService.approveContractForAllEOA(contractAddress, spender)
  }

  return {
    wrapEth,
    transferErc20,
    unwrapEth,
    transferEthers,
    buyOutcomeTokens,
    sellOutcomeTokens,
    client: web3Client,
    checkAllowance,
    checkAllowanceForAll,
    approveContract,
    approveAllowanceForAll,
    redeemPositions,
  }
}
