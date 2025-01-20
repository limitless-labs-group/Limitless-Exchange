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
  isBalanceNotEnough?: boolean
  orderType: MarketOrderType
  setOrderType: (val: MarketOrderType) => void
  sharesAmount: string
  setSharesAmount: (val: string) => void
  price: string
  setPrice: (val: string) => void
  allowance: bigint
  isApprovedForSell: boolean
  outcome: number
  setOutcome: (val: number) => void
  checkMarketAllowance: () => Promise<void>
}

export function ClobWidgetProvider({ children }: PropsWithChildren) {
  const [orderType, setOrderType] = useState(MarketOrderType.MARKET)
  const [outcome, setOutcome] = useState(0)
  const [sharesAmount, setSharesAmount] = useState('')
  const [price, setPrice] = useState('')
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [isApprovedForSell, setIsApprovedForSell] = useState(false)

  const { market, strategy } = useTradingService()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { data: lockedBalance } = useMarketLockedBalance(market?.slug)
  const { data: sharesOwned } = useClobMarketShares(market?.slug, market?.tokens)
  const { data: orderBook } = useOrderBook(market?.slug)
  const { checkAllowance, checkAllowanceForAll } = useWeb3Service()

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
      const amount = new BigNumber(price || '0').dividedBy(100).multipliedBy(sharesAmount)
      console.log(amount.toString())
      const lockedBalanceFormatted = formatUnits(
        BigInt(lockedBalance),
        market?.collateralToken.decimals || 6
      )
      console.log(lockedBalanceFormatted)
      const balanceLeft = new BigNumber(balance).minus(lockedBalanceFormatted)
      console.log(balanceLeft.toString())
      return amount.isGreaterThan(balanceLeft)
    }
    if (orderType === MarketOrderType.MARKET) {
      if (strategy === 'Buy') {
        return new BigNumber(price).isGreaterThan(balance)
      }
    }
  }, [
    balance,
    lockedBalance,
    market?.collateralToken.decimals,
    orderType,
    price,
    sharesAmount,
    strategy,
  ])

  console.log(orderBook)

  return (
    <ClobWidgetContext.Provider
      value={{
        balance,
        orderType,
        isBalanceNotEnough,
        setOrderType,
        price,
        setPrice,
        sharesAmount,
        setSharesAmount,
        allowance,
        isApprovedForSell,
        outcome,
        setOutcome,
        checkMarketAllowance,
      }}
    >
      {children}
    </ClobWidgetContext.Provider>
  )
}
