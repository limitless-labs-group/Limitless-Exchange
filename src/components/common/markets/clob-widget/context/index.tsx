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
}

export function ClobWidgetProvider({ children }: PropsWithChildren) {
  const [orderType, setOrderType] = useState(MarketOrderType.MARKET)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [isApprovedForSell, setIsApprovedForSell] = useState(false)
  const { web3Wallet } = useAccount()
  const {
    market,
    strategy,
    clobOutcome: outcome,
    sharesAmount,
    price,
    sharesAvailable,
    lockedBalance,
  } = useTradingService()
  const { balanceOfSmartWallet } = useBalanceQuery()

  const { data: orderBook } = useOrderBook(market?.slug)
  const { checkAllowance, checkAllowanceForAll } = useWeb3Service()
  const { isOpen: tradeStepperOpen, onToggle: onToggleTradeStepper } = useDisclosure()

  const checkMarketAllowance = async () => {
    const allowance = await checkAllowance(
      process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
      market?.collateralToken.address as Address
    )
    const isApprovedNFT = await checkAllowanceForAll(
      process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
    )
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

  const { yesPrice, noPrice } = useMemo(() => {
    if (orderBook) {
      if (strategy === 'Buy') {
        const yesPrice = orderBook?.asks.sort((a, b) => a.price - b.price)[0]?.price * 100
        const noPrice = (1 - orderBook?.bids.sort((a, b) => b.price - a.price)[0]?.price) * 100
        return {
          yesPrice: isNaN(yesPrice) ? 0 : +yesPrice.toFixed(),
          noPrice: isNaN(noPrice) ? 0 : +noPrice.toFixed(),
        }
      }
      const yesPrice = orderBook?.bids.sort((a, b) => b.price - a.price)[0]?.price * 100
      const noPrice =
        (1 - orderBook?.asks.sort((a, b) => b.price - a.price).reverse()[0]?.price) * 100
      return {
        yesPrice: isNaN(yesPrice) ? 0 : +yesPrice.toFixed(),
        noPrice: isNaN(noPrice) ? 0 : +noPrice.toFixed(),
      }
    }
    return {
      yesPrice: 0,
      noPrice: 0,
    }
  }, [strategy, orderBook])

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
      }}
    >
      {children}
    </ClobWidgetContext.Provider>
  )
}
