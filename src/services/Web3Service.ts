import { SignedOrder } from '@polymarket/order-utils'
import { usePrivy } from '@privy-io/react-auth'
import BigNumber from 'bignumber.js'
import { parseUnits } from 'viem'
import usePrivySendTransaction from '@/hooks/use-smart-wallet-service'
import { useAccount } from '@/services/AccountService'
import { useExternalWalletService } from '@/services/ExternalWalletService'
import { Address } from '@/types'
import { buildOrderTypedData } from '@/utils/orders'

type Web3Service = {
  wrapEth: (value: bigint) => Promise<string | undefined>
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
  placeLimitOrder: (
    tokenId: string,
    decimals: number,
    price: string,
    shares: string,
    side: number
  ) => Promise<SignedOrder>
  placeMarketOrder: (
    tokenId: string,
    decimals: number,
    price: string,
    side: number,
    amount: string
  ) => Promise<SignedOrder>
  splitShares: (
    collateralAddress: Address,
    conditionId: string,
    amount: bigint
  ) => Promise<string | undefined>
  mergeShares: (
    collateralToken: Address,
    conditionId: string,
    amount: bigint
  ) => Promise<string | undefined>
}

export function useWeb3Service(): Web3Service {
  const externalWalletService = useExternalWalletService()
  const privyService = usePrivySendTransaction()

  const { web3Client, account: walletAddress } = useAccount()
  const { user } = usePrivy()

  const wrapEth = async (value: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.wrapEth(value)
    }
    return externalWalletService.wrapEth(value)
  }

  const unwrapEth = async (value: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.unwrapEth(value)
    }
    return externalWalletService.unwrapEth(value)
  }

  const transferEthers = async (to: Address, value: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.transferEthers(to, value)
    }
    return externalWalletService.transferEthers(to, value)
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.transferErc20(token, to, value)
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
    if (web3Client === 'etherspot') {
      return privyService.buyOutcomeTokens(
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
    if (web3Client === 'etherspot') {
      return privyService.sellOutcomeTokens(
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
    if (web3Client === 'etherspot') {
      return privyService.redeemPositions(
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

  const placeLimitOrder = async (
    tokenId: string,
    decimals: number,
    price: string,
    shares: string,
    side: number
  ): Promise<SignedOrder> => {
    const convertedPrice = new BigNumber(price).dividedBy(100).toString()
    const orderData = {
      salt: Math.round(Math.random() * Date.now()) + '',
      maker: walletAddress as Address,
      signer:
        web3Client === 'etherspot'
          ? (user?.wallet?.address as Address)
          : (walletAddress as Address),
      taker: '0x0000000000000000000000000000000000000000',
      tokenId,
      makerAmount:
        side === 0
          ? Math.floor(
              new BigNumber(convertedPrice)
                .multipliedBy(new BigNumber(shares))
                .multipliedBy(new BigNumber(10).pow(decimals))
                .toNumber()
            ).toString()
          : parseUnits(shares, decimals).toString(), // limit price * shares with decimals
      takerAmount:
        side === 0
          ? parseUnits(shares, decimals).toString()
          : Math.floor(
              new BigNumber(convertedPrice)
                .multipliedBy(new BigNumber(shares))
                .multipliedBy(new BigNumber(10).pow(decimals))
                .toNumber()
            ).toString(), // shares * decimals
      expiration: '0',
      nonce: '0',
      feeRateBps: '0',
      side, // buy 0, sell 1
      signatureType: web3Client === 'etherspot' ? 2 : 0,
    }
    const order = buildOrderTypedData(orderData)

    const signature = await externalWalletService.signTypedData(order)
    return {
      ...orderData,
      signature,
    }
  }

  const placeMarketOrder = async (
    tokenId: string,
    decimals: number,
    price: string,
    side: number,
    amount: string
  ) => {
    const convertedPrice = new BigNumber(price).dividedBy(100).toString()
    const orderData = {
      salt: Math.round(Math.random() * Date.now()) + '',
      maker: walletAddress as Address,
      signer:
        web3Client === 'etherspot'
          ? (user?.wallet?.address as Address)
          : (walletAddress as Address),
      taker: '0x0000000000000000000000000000000000000000',
      tokenId,
      makerAmount: parseUnits(amount, decimals).toString(), // amount in $ put in order
      takerAmount: '1',
      // takerAmount:
      //   side === 0
      //     ? parseUnits(
      //         new BigNumber(amount).dividedBy(new BigNumber(convertedPrice)).toString(),
      //         decimals
      //       ).toString()
      //     : parseUnits(
      //         new BigNumber(amount).multipliedBy(new BigNumber(convertedPrice)).toString(),
      //         decimals
      //       ).toString(), // shares * decimals
      expiration: '0',
      nonce: '0',
      feeRateBps: '0',
      side, // buy 0, sell 1
      signatureType: web3Client === 'etherspot' ? 2 : 0,
    }
    const order = buildOrderTypedData(orderData)

    const signature = await externalWalletService.signTypedData(order)
    return {
      ...orderData,
      signature,
    }
  }

  const splitShares = async (collateralAddress: Address, conditionId: string, amount: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.splitPositions(collateralAddress, conditionId, amount)
    }
    return externalWalletService.splitPositions(collateralAddress, conditionId, amount)
  }

  const mergeShares = async (collateralToken: Address, conditionId: string, amount: bigint) => {
    if (web3Client === 'etherspot') {
      return privyService.mergePositions(collateralToken, conditionId, amount)
    }
    return externalWalletService.mergePositions(collateralToken, conditionId, amount)
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
    placeLimitOrder,
    placeMarketOrder,
    splitShares,
    mergeShares,
  }
}
