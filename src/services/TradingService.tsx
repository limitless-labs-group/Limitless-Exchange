import { Toast } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { marketMakerABI } from '@/contracts'
import { useMarketData, useToast } from '@/hooks'
import { publicClient } from '@/providers'
import { useAccount, useBalanceService, useEtherspot, useHistory } from '@/services'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { TransactionReceipt, formatUnits, getContract, parseUnits } from 'viem'

interface ITradingServiceContext {
  market: Market | null
  setMarket: (market: Market | null) => void
  strategy: 'Buy' | 'Sell'
  setStrategy: (side: 'Buy' | 'Sell') => void
  outcomeTokenId: number
  setOutcomeTokenId: (outcomeOption: number) => void
  balanceOfCollateralInvested: string
  collateralAmount: string
  setCollateralAmount: (amount: string) => void
  isExceedsBalance: boolean
  quotes: TradeQuotes | null | undefined
  buy: () => Promise<TransactionReceipt | undefined>
  sell: () => Promise<TransactionReceipt | undefined>
  trade: () => void
  status: TradingServiceStatus
}

const TradingServiceContext = createContext({} as ITradingServiceContext)

export const useTradingService = () => useContext(TradingServiceContext)

export const TradingServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * UI
   */
  const toast = useToast()

  /**
   * SERVICES
   */
  const queryClient = useQueryClient()
  const { trades, getTrades, getCollateralBalance } = useHistory()

  /**
   * ACCOUNT
   */
  const { isLoggedIn, account } = useAccount()

  /**
   * STATE
   */
  const [market, setMarket] = useState<Market | null>(null)
  const marketMakerContract = useMemo(
    () =>
      market
        ? getContract({
            address: market.address[defaultChain.id],
            abi: marketMakerABI,
            client: publicClient,
          })
        : undefined,
    [market]
  )
  const [strategy, setStrategy] = useState<'Buy' | 'Sell'>('Buy')
  const [outcomeTokenId, setOutcomeTokenId] = useState(0)

  const pathname = usePathname()
  useEffect(() => {
    if (pathname.includes('markets/0x')) {
      return
    }
    setMarket(null)
    setCollateralAmount('')
    setStrategy('Buy')
    setOutcomeTokenId(0)
  }, [pathname])

  const refetchChain = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensPrice', market?.address[defaultChain.id]],
    })
    return await refetchbalanceOfSmartWallet()
  }

  const refetchSubgraph = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['marketData', market?.address[defaultChain.id]],
    })
    return await getTrades()
  }

  /**
   * BALANCE
   */
  const { balanceOfSmartWallet, refetchbalanceOfSmartWallet } = useBalanceService()

  const [balanceOfCollateralInvested, setBalanceOfCollateralInvested] = useState('0')

  useEffect(() => {
    if (!market || !trades || strategy != 'Sell') {
      setBalanceOfCollateralInvested('0')
      return
    }
    getCollateralBalance(market.address[defaultChain.id], outcomeTokenId).then(
      (collateralBalance) => setBalanceOfCollateralInvested(collateralBalance)
    )
  }, [market, outcomeTokenId, trades, strategy])

  /**
   * AMOUNT
   */
  const [collateralAmount, setCollateralAmount] = useState<string>('')
  const collateralAmountBI = useMemo(
    () => parseUnits(collateralAmount ?? '0', collateralToken.decimals),
    [collateralAmount, collateralToken]
  )

  const isExceedsBalance = useMemo(() => {
    if (strategy == 'Buy') {
      return Number(collateralAmount) > Number(balanceOfSmartWallet?.formatted ?? 0)
    }
    return Number(collateralAmount) > Number(balanceOfCollateralInvested)
  }, [strategy, balanceOfCollateralInvested, collateralAmount, balanceOfSmartWallet])

  const isInvalidCollateralAmount = collateralAmountBI <= 0n || isExceedsBalance

  /**
   * TRADE QUOTES
   */
  const [quotes, setQuotes] = useState<TradeQuotes | null>(null)

  const { outcomeTokensPrice: outcomeTokensPriceCurrent } = useMarketData({
    marketAddress: market?.address[defaultChain.id],
  })

  useQuery({
    queryKey: [
      'tradeQuotes',
      marketMakerContract?.address,
      collateralAmount,
      outcomeTokenId,
      strategy,
      outcomeTokensPriceCurrent,
    ],
    queryFn: async () => {
      if (!marketMakerContract || !(Number(collateralAmount) > 0)) {
        return setQuotes(null)
      }

      let outcomeTokenAmountBI = 0n
      if (strategy == 'Buy') {
        outcomeTokenAmountBI = (await marketMakerContract.read.calcBuyAmount([
          collateralAmountBI,
          outcomeTokenId,
        ])) as bigint
      } else if (strategy == 'Sell') {
        outcomeTokenAmountBI = (await marketMakerContract.read.calcSellAmount([
          collateralAmountBI,
          outcomeTokenId,
        ])) as bigint
      }

      const outcomeTokenAmount = formatUnits(outcomeTokenAmountBI, 18)
      const outcomeTokenPrice = (Number(collateralAmount) / Number(outcomeTokenAmount)).toString()
      const roi = ((Number(outcomeTokenAmount) / Number(collateralAmount) - 1) * 100).toString()
      const priceImpact = Math.abs(
        (Number(outcomeTokenPrice) / Number(outcomeTokensPriceCurrent?.[outcomeTokenId] ?? 1) - 1) *
          100
      ).toString()

      const _quotes: TradeQuotes = {
        outcomeTokenPrice,
        outcomeTokenAmount,
        roi,
        priceImpact,
      }
      console.log('tradeQuotes', _quotes)

      setQuotes(_quotes)
      return quotes
    },
  })

  /**
   * BUY
   */
  const { etherspot } = useEtherspot()
  const { mutateAsync: buy, isPending: isLoadingBuy } = useMutation({
    mutationFn: async () => {
      if (!etherspot || !account || !market || isInvalidCollateralAmount || !quotes) {
        return
      }

      // TODO: incapsulate
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })

      const receipt = await etherspot.buyOutcomeTokens(
        market.address[defaultChain.id],
        collateralAmountBI,
        outcomeTokenId,
        parseUnits(quotes.outcomeTokenAmount, 18)
      )

      if (!receipt) {
        toast({
          render: () => <Toast title={`Unsuccessful transaction. Please, contact our support.`} />,
        })
        return
      }

      setCollateralAmount('')
      await refetchChain()

      // TODO: incapsulate
      toast({
        render: () => (
          <Toast
            title={`Successfully invested ${NumberUtil.toFixed(collateralAmount, 4)} ${
              collateralToken.symbol
            }`}
          />
        ),
      })
      await sleep(1)
      toast({
        render: () => <Toast title={`Updating markets data...`} />,
      })

      // TODO: redesign subgraph refetch logic
      sleep(10).then(() => {
        refetchSubgraph()
      })

      return receipt
    },
  })

  /**
   * SELL
   */
  const { mutateAsync: sell, isPending: isLoadingSell } = useMutation({
    mutationFn: async () => {
      if (!etherspot || !account || !market || isInvalidCollateralAmount || !quotes) {
        return
      }

      // TODO: incapsulate
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })

      const receipt = await etherspot.sellOutcomeTokens(
        market.address[defaultChain.id],
        collateralAmountBI,
        outcomeTokenId,
        parseUnits(quotes.outcomeTokenAmount, 18)
      )

      if (!receipt) {
        toast({
          render: () => <Toast title={`Unsuccessful transaction. Please, contact our support.`} />,
        })
        return
      }

      setCollateralAmount('')
      await refetchChain()

      // TODO: incapsulate
      toast({
        render: () => (
          <Toast
            title={`Successfully redeemed ${NumberUtil.toFixed(collateralAmount, 4)} ${
              collateralToken.symbol
            }`}
          />
        ),
      })
      await sleep(1)
      toast({
        render: () => <Toast title={`Updating markets data...`} />,
      })

      // TODO: redesign subgraph refetch logic
      sleep(10).then(() => {
        refetchSubgraph()
      })

      return receipt
    },
  })

  const trade = useCallback(() => {
    strategy == 'Buy' ? buy() : sell()
  }, [strategy])

  /**
   * STATUS
   */
  const status = useMemo<TradingServiceStatus>(() => {
    if (!isLoggedIn) {
      return 'Disconnected'
    }
    if (isInvalidCollateralAmount) {
      return 'InvalidAmount'
    }
    if (isLoadingBuy || isLoadingSell) {
      return 'Loading'
    }
    // if ('tx') {
    //   return 'Submitted'
    // }
    return 'Ready'
    // return 'Idle'
  }, [isLoggedIn, isInvalidCollateralAmount, isLoadingBuy, isLoadingSell])

  const contextProviderValue: ITradingServiceContext = {
    market,
    setMarket,
    strategy,
    setStrategy,
    outcomeTokenId,
    setOutcomeTokenId,
    collateralAmount,
    setCollateralAmount,
    isExceedsBalance,
    balanceOfCollateralInvested,
    quotes,
    buy,
    sell,
    trade,
    status,
  }

  return (
    <TradingServiceContext.Provider value={contextProviderValue}>
      {children}
    </TradingServiceContext.Provider>
  )
}

export type TradingServiceStatus =
  | 'Disconnected'
  | 'InvalidAmount'
  | 'Ready'
  | 'Submitted'
  | 'Loading'
  | 'Idle'

export type TradeQuotes = {
  outcomeTokenPrice: string // average cost per outcome token
  outcomeTokenAmount: string // amount of outcome token to be traded based on collateral amount input
  roi: string // return on investment aka profitability percentage
  priceImpact: string // price fluctuation percentage
}
