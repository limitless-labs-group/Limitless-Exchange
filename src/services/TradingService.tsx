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
  balanceOfShares: number
  balanceOfInvest: string | undefined
  amount: string
  setAmount: (amount: string) => void
  isExceedsBalance: boolean
  shareCost: string
  sharesAmount: string
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

  const [balanceOfShares, setBalanceOfShares] = useState(0)
  useEffect(() => {
    if (!market || !trades || strategy != 'Sell') {
      setBalanceOfShares(0)
      return
    }
    getMarketSharesBalance(market, outcomeTokenSelected).then((_balanceShares) =>
      setBalanceOfShares(_balanceShares)
    )
  }, [market, outcomeTokenSelected, trades, strategy])

  const { data: balanceOfInvest } = useQuery({
    queryKey: [
      'balanceOfInvest',
      marketMakerContract?.address,
      outcomeTokenSelected,
      strategy,
      balanceOfShares,
    ],
    queryFn: async () => {
      if (!marketMakerContract || !(balanceOfShares > 0)) {
        return '0'
      }

      const balanceOfSharesBI = parseUnits(balanceOfShares.toString(), 18)
      const outcomeTokenAmounts = Array.from({ length: 2 }, (v, i) =>
        i === outcomeTokenSelected ? balanceOfSharesBI * -1n : 0n
      )
      const balanceOfInvestBI =
        ((await marketMakerContract.read.calcNetCost([outcomeTokenAmounts])) as bigint) * -1n
      const _balanceOfInvest = formatUnits(balanceOfInvestBI, 18)
      return _balanceOfInvest
    },
  })

  /**
   * AMOUNT OF COLLATERAL TOKEN TO BUY/SELL
   */
  const [amount, setAmount] = useState<string>('')
  const amountBI = useMemo(
    () => parseUnits(amount ?? '0', collateralToken.decimals),
    [amount, collateralToken]
  )

  const isExceedsBalance = useMemo(() => {
    if (strategy == 'Buy') {
      return Number(amount) > Number(balanceOfSmartWallet?.formatted ?? 0)
    }
    return Number(amount) > balanceOfShares
  }, [strategy, balanceOfShares, amount, balanceOfSmartWallet])

  const isInvalidAmount = amountBI <= 0n || isExceedsBalance

  /**
   * TRADE QUOTES
   */
  const [sharesAmount, setSharesAmount] = useState('0')
  const [shareCost, setShareCost] = useState<string>('0')
  const [roi, setRoi] = useState<string>('0')

  useQuery({
    queryKey: ['tradeQuotes', marketMakerContract?.address, amount, outcomeTokenSelected, strategy],
    queryFn: async () => {
      if (!marketMakerContract || amount === '' || Number(amount) <= 0) {
        setShareCost('0')
        setSharesAmount('0')
        setRoi('0')
        return null
      }

      // TODO: add market fee
      let sharesAmountBI = 0n
      if (strategy == 'Buy') {
        sharesAmountBI = (await marketMakerContract.read.calcBuyAmount([
          amountBI,
          outcomeTokenSelected,
        ])) as bigint
      } else if (strategy == 'Sell') {
        sharesAmountBI = (await marketMakerContract.read.calcSellAmount([
          amountBI,
          outcomeTokenSelected,
        ])) as bigint
      }

      const sharesAmount = formatUnits(sharesAmountBI, 18)
      setSharesAmount(sharesAmount)

      const _shareCost = (Number(amount) / Number(sharesAmount)).toString()
      setShareCost(_shareCost)

      const roi = ((Number(sharesAmount) / Number(amount) - 1) * 100).toString()
      setRoi(roi)
    },
  })

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
        parseUnits(sharesAmount, 18),
        outcomeTokenSelected,
        market.outcomeTokens.length
      )

      setAmount('')
      await refetchChain()

      // TODO: incapsulate
      toast({
        render: () => (
          <Toast
            title={`Successfully invested ${NumberUtil.toFixed(amount, 4)} ${
              collateralToken.symbol
            }`}
          />
        ),
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
        parseUnits(sharesAmount, 18),
        outcomeTokenSelected,
        market.outcomeTokens.length
      )

      setAmount('')
      await refetchChain()

      // TODO: incapsulate
      toast({
        render: () => (
          <Toast
            title={`Successfully redeemed ${NumberUtil.toFixed(amount, 4)} ${
              collateralToken.symbol
            }`}
          />
        ),
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
    balanceOfShares,
    balanceOfInvest,
    shareCost,
    sharesAmount,
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
