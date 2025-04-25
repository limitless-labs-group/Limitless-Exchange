import { useDisclosure } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  PropsWithChildren,
  useEffect,
} from 'react'
import { Address, formatUnits } from 'viem'
import useClobMarketShares from '@/hooks/use-clob-market-shares'
import useMarketLockedBalance from '@/hooks/use-market-locked-balance'
import { useOrderBook } from '@/hooks/use-order-book'
import { useAccount, useBalanceQuery, useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { MarketOrderType } from '@/types'

const ClobWidgetContext = createContext<ClobWidgetContextType | undefined>(undefined)

export const useClobWidget = (): ClobWidgetContextType => {
  const context = useContext(ClobWidgetContext)
  if (!context) {
    throw new Error('useClobWidget must be used within a ClobWidgetProvider')
  }
  return context
}

interface ClobWidgetContextType {
  balance: string
  isBalanceNotEnough: boolean
  orderType: MarketOrderType
  setOrderType: (val: MarketOrderType) => void
  allowance: bigint
  isApprovedForSell: boolean
  checkMarketAllowance: () => Promise<void>
  tradeStepperOpen: boolean
  onToggleTradeStepper: () => void
  yesPrice: number
  noPrice: number
  sharesPrice: string
  sharesAmount: string
  setSharesAmount: (val: string) => void
  price: string
  setPrice: (val: string) => void
  sharesAvailable: {
    yes: bigint
    no: bigint
  }
  isApprovedNegRiskForSell: boolean
}

export function ClobWidgetProvider({ children }: PropsWithChildren) {
  const [orderType, setOrderType] = useState(MarketOrderType.MARKET)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [isApprovedNegRiskForSell, setIsApprovedNegRiskForSell] = useState(false)
  const [isApprovedForSell, setIsApprovedForSell] = useState(false)
  const { web3Wallet } = useAccount()
  const { market, strategy, clobOutcome: outcome } = useTradingService()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const [sharesAmount, setSharesAmount] = useState('')
  const [price, setPrice] = useState('')

  const { data: lockedBalance } = useMarketLockedBalance(market?.slug)
  const { data: sharesOwned } = useClobMarketShares(market?.slug, market?.tokens)

  const sharesAvailable = useMemo(() => {
    if (sharesOwned && lockedBalance) {
      return {
        yes: BigInt(
          new BigNumber(sharesOwned[0].toString())
            .minus(new BigNumber(lockedBalance.yes))
            .isNegative()
            ? '0'
            : new BigNumber(sharesOwned[0].toString())
                .minus(new BigNumber(lockedBalance.yes))
                .toString()
        ),
        no: BigInt(
          new BigNumber(sharesOwned[1].toString())
            .minus(new BigNumber(lockedBalance.no))
            .isNegative()
            ? '0'
            : new BigNumber(sharesOwned[1].toString())
                .minus(new BigNumber(lockedBalance.no))
                .toString()
        ),
      }
    }
    return {
      yes: 0n,
      no: 0n,
    }
  }, [lockedBalance, sharesOwned])

  const { data: orderBook } = useOrderBook(market?.slug, market?.tradeType)
  const { checkAllowance, checkAllowanceForAll } = useWeb3Service()
  const { isOpen: tradeStepperOpen, onToggle: onToggleTradeStepper } = useDisclosure()

  const checkMarketAllowance = async () => {
    const contractAddress = market?.negRiskRequestId
      ? process.env.NEXT_PUBLIC_NEGRISK_CTF_EXCHANGE
      : process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR
    const allowance = await checkAllowance(
      contractAddress as Address,
      market?.collateralToken.address as Address
    )
    const operator = market?.negRiskRequestId
      ? process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
      : process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR
    const isApprovedNFT = await checkAllowanceForAll(
      operator as Address,
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
    )
    if (market?.negRiskRequestId) {
      const isAppovedNegRisk = await checkAllowanceForAll(
        process.env.NEXT_PUBLIC_NEGRISK_CTF_EXCHANGE as Address,
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
      )
      setIsApprovedNegRiskForSell(isAppovedNegRisk)
    }
    setAllowance(allowance)
    setIsApprovedForSell(isApprovedNFT)
  }

  const balance = useMemo(() => {
    if (balanceOfSmartWallet) {
      return (
        balanceOfSmartWallet.find(
          (balanceItem) => balanceItem.contractAddress === market?.collateralToken.address
        )?.formatted || ''
      )
    }
    return ''
  }, [balanceOfSmartWallet, strategy, market])

  const isBalanceNotEnough = useMemo(() => {
    if (orderType === MarketOrderType.LIMIT) {
      if (strategy === 'Buy') {
        const amount = new BigNumber(price || '0').dividedBy(100).multipliedBy(sharesAmount)
        const lockedBalanceFormatted = formatUnits(
          BigInt(lockedBalance?.collateral.balance.toFixed() || '0'),
          market?.collateralToken.decimals || 6
        )
        const balanceLeft = new BigNumber(balance).minus(lockedBalanceFormatted)
        return amount.isGreaterThan(balanceLeft)
      }
      const sharesFormatted = formatUnits(
        sharesAvailable[outcome ? 'no' : 'yes'],
        market?.collateralToken.decimals || 6
      )
      return new BigNumber(sharesFormatted).isLessThan(sharesAmount)
    }
    if (orderType === MarketOrderType.MARKET) {
      if (strategy === 'Buy') {
        return new BigNumber(price).isGreaterThan(balance)
      }
      const sharesFormatted = formatUnits(
        sharesAvailable[outcome ? 'no' : 'yes'],
        market?.collateralToken.decimals || 6
      )
      return new BigNumber(sharesFormatted).isLessThan(price)
    }
    return false
  }, [
    balance,
    lockedBalance?.collateral.balance,
    market?.collateralToken.decimals,
    orderType,
    outcome,
    price,
    sharesAmount,
    sharesAvailable,
    strategy,
  ])

  const yesPrice = useMemo(() => {
    if (!market?.tradePrices) {
      return 50
    }
    if (strategy === 'Buy') {
      return orderType === MarketOrderType.MARKET
        ? new BigNumber(market.tradePrices.buy.market[0])
            .multipliedBy(100)
            .decimalPlaces(1)
            .toNumber()
        : new BigNumber(market.tradePrices.buy.limit[0])
            .multipliedBy(100)
            .decimalPlaces(1)
            .toNumber()
    }
    return orderType === MarketOrderType.MARKET
      ? new BigNumber(market.tradePrices.sell.market[0])
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber()
      : new BigNumber(market.tradePrices.sell.limit[0])
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber()
  }, [strategy, market?.tradePrices, orderType])
  const noPrice = useMemo(() => {
    if (!market?.tradePrices) {
      return 50
    }
    if (strategy === 'Buy') {
      return orderType === MarketOrderType.MARKET
        ? new BigNumber(market.tradePrices.buy.market[1])
            .multipliedBy(100)
            .decimalPlaces(1)
            .toNumber()
        : new BigNumber(market.tradePrices.buy.limit[1])
            .multipliedBy(100)
            .decimalPlaces(1)
            .toNumber()
    }
    return orderType === MarketOrderType.MARKET
      ? new BigNumber(market.tradePrices.sell.market[1])
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber()
      : new BigNumber(market.tradePrices.sell.limit[1])
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber()
  }, [strategy, market?.tradePrices, orderType])

  const sharesPrice = useMemo(() => {
    if (orderType === MarketOrderType.LIMIT) {
      if (price && sharesAmount) {
        return new BigNumber(price).dividedBy(100).multipliedBy(sharesAmount).toString()
      }
      return '0'
    }
    if (price) {
      return price.toString()
    }
    return '0'
  }, [orderType, price, sharesAmount])

  useEffect(() => {
    if (web3Wallet && market) {
      checkMarketAllowance()
    }
  }, [market, web3Wallet])

  return (
    <ClobWidgetContext.Provider
      value={{
        balance,
        orderType,
        isBalanceNotEnough,
        setOrderType,
        allowance,
        isApprovedForSell,
        checkMarketAllowance,
        tradeStepperOpen,
        onToggleTradeStepper,
        yesPrice,
        noPrice,
        sharesPrice,
        price,
        setPrice,
        sharesAmount,
        setSharesAmount,
        sharesAvailable,
        isApprovedNegRiskForSell,
      }}
    >
      {children}
    </ClobWidgetContext.Provider>
  )
}
