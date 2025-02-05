import { useDisclosure } from '@chakra-ui/react'
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  PropsWithChildren,
  useEffect,
} from 'react'
import { Address, formatUnits, maxUint256, parseUnits } from 'viem'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import useClobMarketShares from '@/hooks/use-clob-market-shares'
import useMarketLockedBalance from '@/hooks/use-market-locked-balance'
import { useOrderBook } from '@/hooks/use-order-book'
import usePrivySendTransaction from '@/hooks/use-smart-wallet-service'
import { useAccount, useBalanceQuery, useTradingService } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
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
  sharesAmount: string
  setSharesAmount: (val: string) => void
  price: string
  setPrice: (val: string) => void
  allowance: bigint
  isApprovedForSell: boolean
  checkMarketAllowance: () => Promise<void>
  tradeStepperOpen: boolean
  onToggleTradeStepper: () => void
  yesPrice: number
  noPrice: number
  placeLimitOrderMutation: UseMutationResult<
    AxiosResponse<Record<string, unknown>> | undefined,
    Error,
    void,
    unknown
  >
  placeMarketOrderMutation: UseMutationResult<
    AxiosResponse<Record<string, unknown>> | undefined,
    Error,
    void,
    unknown
  >
  sharesPrice: string
  sharesAvailable: {
    yes: bigint
    no: bigint
  }
}

export function ClobWidgetProvider({ children }: PropsWithChildren) {
  const [orderType, setOrderType] = useState(MarketOrderType.MARKET)
  const [sharesAmount, setSharesAmount] = useState('')
  const [price, setPrice] = useState('')
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [isApprovedForSell, setIsApprovedForSell] = useState(false)
  const { web3Wallet, web3Client } = useAccount()
  const toast = useToast()
  const { market, strategy, clobOutcome: outcome } = useTradingService()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { data: lockedBalance } = useMarketLockedBalance(market?.slug)
  const { data: orderBook } = useOrderBook(market?.slug)
  const { checkAllowance, checkAllowanceForAll } = useWeb3Service()
  const { isOpen: tradeStepperOpen, onToggle: onToggleTradeStepper } = useDisclosure()
  const privateClient = useAxiosPrivateClient()
  const { profileData } = useAccount()
  const { placeLimitOrder, placeMarketOrder } = useWeb3Service()
  const { data: sharesOwned } = useClobMarketShares(market?.slug, market?.tokens)
  const privyService = usePrivySendTransaction()

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

  const sharesAvailable = useMemo(() => {
    if (sharesOwned && lockedBalance) {
      return {
        yes: BigInt(
          new BigNumber(sharesOwned[0].toString())
            .minus(new BigNumber(lockedBalance.yes))
            .toString()
        ),
        no: BigInt(
          new BigNumber(sharesOwned[1].toString()).minus(new BigNumber(lockedBalance.no)).toString()
        ),
      }
    }
    return {
      yes: 0n,
      no: 0n,
    }
  }, [lockedBalance, sharesOwned])

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
      const noPrice = (1 - orderBook?.asks.sort((a, b) => b.price - a.price)[0]?.price) * 100
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

  const placeLimitOrderMutation = useMutation({
    mutationKey: ['limit-order', market?.address, price],
    mutationFn: async () => {
      if (market) {
        if (web3Client === 'etherspot') {
          if (strategy === 'Sell') {
            await privyService.approveConditionalIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
            )
          } else {
            await privyService.approveCollateralIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              maxUint256,
              market?.collateralToken.address as Address
            )
          }
        }
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeLimitOrder(
          tokenId,
          market.collateralToken.decimals,
          price,
          sharesAmount,
          side
        )
        const data = {
          order: {
            ...signedOrder,
            salt: +signedOrder.salt,
            price: new BigNumber(price).dividedBy(100).toNumber(),
            makerAmount: +signedOrder.makerAmount,
            takerAmount: +signedOrder.takerAmount,
            nonce: +signedOrder.nonce,
            feeRateBps: +signedOrder.feeRateBps,
          },
          ownerId: profileData?.id,
          orderType: 'GTC',
          marketSlug: market.slug,
        }
        return privateClient.post('/orders', data)
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const id = toast({
        render: () => <Toast title={error.response?.data.message || ''} id={id} />,
      })
    },
  })

  const placeMarketOrderMutation = useMutation({
    mutationKey: ['market-order', market?.address, price],
    mutationFn: async () => {
      if (market) {
        if (web3Client === 'etherspot') {
          if (strategy === 'Sell') {
            await privyService.approveConditionalIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
            )
          } else {
            await privyService.approveCollateralIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              maxUint256,
              market?.collateralToken.address as Address
            )
          }
        }
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeMarketOrder(
          tokenId,
          market.collateralToken.decimals,
          outcome === 0 ? yesPrice.toString() : noPrice.toString(),
          side,
          price
        )
        const data = {
          order: {
            ...signedOrder,
            salt: +signedOrder.salt,
            price: undefined,
            makerAmount: +parseUnits(price, market.collateralToken.decimals).toString(),
            takerAmount: +signedOrder.takerAmount,
            nonce: +signedOrder.nonce,
            feeRateBps: +signedOrder.feeRateBps,
          },
          ownerId: profileData?.id,
          orderType: 'FOK',
          marketSlug: market.slug,
        }
        return privateClient.post('/orders', data)
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const id = toast({
        render: () => <Toast title={error.response?.data.message || ''} id={id} />,
      })
    },
  })

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
        price,
        setPrice,
        sharesAmount,
        setSharesAmount,
        allowance,
        isApprovedForSell,
        checkMarketAllowance,
        tradeStepperOpen,
        onToggleTradeStepper,
        yesPrice,
        noPrice,
        placeLimitOrderMutation,
        placeMarketOrderMutation,
        sharesPrice,
        sharesAvailable,
      }}
    >
      {children}
    </ClobWidgetContext.Provider>
  )
}
