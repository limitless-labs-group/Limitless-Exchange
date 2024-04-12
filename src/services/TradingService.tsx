import { Toast } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { marketMakerABI } from '@/contracts'
import { useToast } from '@/hooks'
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
  outcomeTokenSelected: number
  setOutcomeTokenSelected: (outcomeOption: number) => void
  balanceShares: number
  amount: string
  setAmount: (amount: string) => void
  isExceedsBalance: boolean
  netCost: string
  shareCost: string
  roi: string
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
  const { trades, getTrades, getMarketSharesBalance } = useHistory()

  /**
   * ACCOUNT
   */
  const { isLoggedIn, account } = useAccount()

  /**
   * STATE
   */
  const [market, setMarket] = useState<Market | null>(null)
  const [strategy, setStrategy] = useState<'Buy' | 'Sell'>('Buy')
  const [outcomeTokenSelected, setOutcomeTokenSelected] = useState(0)

  const pathname = usePathname()
  useEffect(() => {
    if (pathname.includes('markets/0x')) {
      return
    }
    setMarket(null)
    setAmount('')
    setStrategy('Buy')
    setOutcomeTokenSelected(0)
  }, [pathname])

  const refetchChain = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['sharesCost', market?.address[defaultChain.id]],
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

  const [balanceShares, setBalanceShares] = useState(0)
  useEffect(() => {
    if (!market || !trades || strategy != 'Sell') {
      setBalanceShares(0)
      return
    }
    getMarketSharesBalance(market, outcomeTokenSelected).then((_balanceShares) =>
      setBalanceShares(_balanceShares)
    )
  }, [market, outcomeTokenSelected, trades, strategy])

  /**
   * AMOUNT
   */
  const [amount, setAmount] = useState<string>('')
  const amountBI = useMemo(
    () => parseUnits(amount ?? '0', collateralToken.decimals),
    [amount, collateralToken]
  )

  /**
   * COSTS
   */
  const [netCost, setNetCost] = useState<string>('')
  const [shareCost, setShareCost] = useState<string>('')
  const [roi, setRoi] = useState<string>('')

  useQuery({
    queryKey: ['tradeQuotes', market, amount, outcomeTokenSelected, strategy],
    queryFn: async () => {
      if (!market || amount === '' || Number(amount) <= 0) {
        setNetCost('')
        setShareCost('')
        setRoi('')
        return null
      }

      const marketMakerContract = getContract({
        address: market.address[defaultChain.id],
        abi: marketMakerABI,
        client: publicClient,
      })
      const amounts = Array.from({ length: market.outcomeTokens.length }, (_, index) =>
        index === outcomeTokenSelected
          ? Number(amountBI) > 0
            ? amountBI * (strategy == 'Buy' ? 1n : -1n)
            : 1n
          : 0n
      )
      const netCostBI =
        ((await marketMakerContract.read.calcNetCost([amounts])) as bigint) *
        (strategy == 'Buy' ? 1n : -1n)
      const netCost = formatUnits(netCostBI, collateralToken.decimals)
      const tokenCost = NumberUtil.toFixed(Number(netCost) / Number(amount), 3)
      const roi = NumberUtil.toFixed((Number(amount) / Number(netCost) - 1) * 100, 2)
      setNetCost(netCost)
      setShareCost(tokenCost)
      setRoi(roi)
      return netCost
    },
  })

  const isExceedsBalance = useMemo(() => {
    if (strategy == 'Buy') {
      return Number(netCost) > Number(balanceOfSmartWallet?.formatted ?? 0)
    }
    return Number(amount) > balanceShares
  }, [strategy, balanceShares, amount, netCost, balanceOfSmartWallet])

  const isInvalidAmount = amountBI <= 0n || isExceedsBalance

  /**
   * BUY
   */
  const { etherspot } = useEtherspot()
  const { mutateAsync: buy, isPending: isLoadingBuy } = useMutation({
    mutationFn: async () => {
      if (!etherspot || !account || !market || isInvalidAmount) {
        return
      }

      // TODO: incapsulate
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })

      const receipt = await etherspot.buyOutcomeTokens(
        market.address[defaultChain.id],
        amountBI,
        outcomeTokenSelected,
        market.outcomeTokens.length
      )

      setAmount('')
      await refetchChain()

      // TODO: incapsulate
      toast({
        render: () => <Toast title={`Successfully staked $${NumberUtil.toFixed(netCost, 2)}`} />,
      })
      await sleep(1)
      toast({
        render: () => <Toast title={`Updating markets data...`} />,
      })

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
      if (!etherspot || !account || !market || isInvalidAmount) {
        return
      }

      // TODO: incapsulate
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })

      const receipt = await etherspot.sellOutcomeTokens(
        market.address[defaultChain.id],
        amountBI,
        outcomeTokenSelected,
        market.outcomeTokens.length
      )

      setAmount('')
      await refetchChain()

      // TODO: incapsulate
      toast({
        render: () => <Toast title={`Successfully redeemed $${NumberUtil.toFixed(netCost, 2)}`} />,
      })
      await sleep(1)
      toast({
        render: () => <Toast title={`Updating markets data...`} />,
      })

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
    if (isInvalidAmount) {
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
  }, [isLoggedIn, isInvalidAmount, isLoadingBuy, isLoadingSell])

  const contextProviderValue: ITradingServiceContext = {
    market,
    setMarket,
    strategy,
    setStrategy,
    outcomeTokenSelected,
    setOutcomeTokenSelected,
    amount,
    setAmount,
    isExceedsBalance,
    balanceShares,
    shareCost,
    netCost,
    roi,
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

// interface ITrade {
//   marketMakerAddress?: Address
//   amount: bigint
//   onSign?: () => void
//   onConfirm?: (receipt: TransactionReceipt) => Promise<any>
// }
