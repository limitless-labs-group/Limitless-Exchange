import { Toast } from '@/components'
import { collateralToken, conditionalTokensAddress, defaultChain } from '@/constants'
import { conditionalTokensABI, fixedProductMarketMakerABI } from '@/contracts'
import { useMarketData, useToast } from '@/hooks'
import { publicClient } from '@/providers'
import { useAccount, useBalanceService, useEtherspot, useHistory } from '@/services'
import { Market } from '@/types'
import { NumberUtil, calcSellAmountInCollateral } from '@/utils'
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
import {
  Address,
  Hash,
  TransactionReceipt,
  formatEther,
  formatUnits,
  getContract,
  parseEther,
  parseUnits,
  zeroHash,
} from 'viem'

interface ITradingServiceContext {
  market: Market | null
  setMarket: (market: Market | null) => void
  strategy: 'Buy' | 'Sell'
  setStrategy: (side: 'Buy' | 'Sell') => void
  outcomeTokenId: number
  setOutcomeTokenId: (outcomeOption: number) => void
  balanceOfCollateralToSell: string
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

export const TradingServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * UI HELPERS
   */
  const toast = useToast()

  /**
   * SERVICES
   */
  const queryClient = useQueryClient()
  const { getTrades } = useHistory()

  /**
   * ACCOUNT
   */
  const { isLoggedIn, account } = useAccount()

  /**
   * OPTIONS
   */
  const [market, setMarket] = useState<Market | null>(null)
  const [strategy, setStrategy] = useState<'Buy' | 'Sell'>('Buy')
  const [outcomeTokenId, setOutcomeTokenId] = useState(0)

  /**
   * REFRESH / REFETCH
   */
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

  // TODO: refactor
  const refetchChain = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensBuyPrice', market?.address[defaultChain.id]],
    })
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensSellPrice', market?.address[defaultChain.id]],
    })
    await refetchbalanceOfSmartWallet()
    await updateSellBalance()
  }

  // TODO: refactor
  const refetchSubgraph = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['marketData', market?.address[defaultChain.id]],
    })
    await getTrades()
  }

  /**
   * CONTRACTS
   * TODO: incapsulate with utils
   */
  const fixedProductMarketMakerContract = useMemo(
    () =>
      market
        ? getContract({
            address: market.address[defaultChain.id],
            abi: fixedProductMarketMakerABI,
            client: publicClient,
          })
        : undefined,
    [market]
  )

  const conditionalTokensContract = getContract({
    address: conditionalTokensAddress[defaultChain.id],
    abi: conditionalTokensABI,
    client: publicClient,
  })

  /**
   * BALANCE TO BUY
   */
  const { balanceOfSmartWallet, refetchbalanceOfSmartWallet } = useBalanceService()

  /**
   * BALANCE TO SELL
   */
  const [balanceOfOutcomeToken, setBalanceOfOutcomeToken] = useState('0') // getCTBalance
  const [balanceOfCollateralToSell, setBalanceOfCollateralToSell] = useState('0') // ctBalance converted to collateral

  // conditional tokens balance
  // TODO: incapsulate
  const getCTBalance = async (
    account: Address | undefined,
    outcomeIndex: number
  ): Promise<bigint> => {
    if (!market || !account) {
      return 0n
    }
    // const conditionId = await conditionalTokensContract.read.getConditionId([
    //   zeroAddress,
    //   market.questionId[defaultChain.id],
    //   market.outcomeTokens.length,
    // ])
    const collectionId = (await conditionalTokensContract.read.getCollectionId([
      zeroHash, // Since we don't support complicated conditions at the moment
      market.conditionId[defaultChain.id],
      1 << outcomeIndex,
    ])) as Hash
    const positionId = (await conditionalTokensContract.read.getPositionId([
      collateralToken.address[defaultChain.id],
      collectionId,
    ])) as bigint
    const balance = (await conditionalTokensContract.read.balanceOf([
      account,
      positionId,
    ])) as bigint
    return balance
  }

  const updateSellBalance = useCallback(async () => {
    setBalanceOfCollateralToSell('0')
    setBalanceOfOutcomeToken('0')

    if (!market || !fixedProductMarketMakerContract || strategy != 'Sell') {
      return
    }

    const balanceOfOutcomeTokenBI = await getCTBalance(account, outcomeTokenId)
    const _balanceOfOutcomeToken = formatEther(balanceOfOutcomeTokenBI)
    const balanceOfOutcomeTokenCropped = NumberUtil.toFixed(_balanceOfOutcomeToken, 10)
    setBalanceOfOutcomeToken(balanceOfOutcomeTokenCropped)
    console.log('balanceOfOutcomeToken', _balanceOfOutcomeToken)

    const holdings = await getCTBalance(market.address[defaultChain.id], outcomeTokenId)
    const otherHoldings: bigint[] = []
    for (let index = 0; index < market.outcomeTokens.length; index++) {
      if (index != outcomeTokenId) {
        const balance = await getCTBalance(market.address[defaultChain.id], index)
        otherHoldings.push(balance)
      }
    }
    const feeBI = (await fixedProductMarketMakerContract.read.fee()) as bigint
    const fee = Number(formatUnits(feeBI, collateralToken.decimals))

    let balanceOfCollateralToSellBI =
      calcSellAmountInCollateral(
        parseEther(balanceOfOutcomeTokenCropped),
        holdings,
        otherHoldings,
        fee
      ) ?? 0n
    // small balance to zero
    if (balanceOfCollateralToSellBI < parseUnits('0.000001', collateralToken.decimals)) {
      balanceOfCollateralToSellBI = 0n
    }

    const _balanceOfCollateralToSell = formatUnits(
      balanceOfCollateralToSellBI,
      collateralToken.decimals
    )

    console.log('balanceOfCollateralToSell', _balanceOfCollateralToSell)

    setBalanceOfCollateralToSell(_balanceOfCollateralToSell)
  }, [account, market, outcomeTokenId, strategy])

  useEffect(() => {
    updateSellBalance()
  }, [market, outcomeTokenId, strategy])

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
    return Number(collateralAmount) > Number(balanceOfCollateralToSell)
  }, [strategy, balanceOfCollateralToSell, collateralAmount, balanceOfSmartWallet])

  const isInvalidCollateralAmount = collateralAmountBI <= 0n || isExceedsBalance

  /**
   * QUOTES
   */
  const [quotes, setQuotes] = useState<TradeQuotes | null>(null)

  // current price for price impact calculation
  const {
    outcomeTokensBuyPrice: outcomeTokensBuyPriceCurrent,
    outcomeTokensSellPrice: outcomeTokensSellPriceCurrent,
  } = useMarketData({
    marketAddress: market?.address[defaultChain.id],
  })

  useQuery({
    queryKey: [
      'tradeQuotes',
      fixedProductMarketMakerContract?.address,
      collateralAmount,
      balanceOfOutcomeToken,
      outcomeTokenId,
      strategy,
      outcomeTokensBuyPriceCurrent,
      outcomeTokensSellPriceCurrent,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !(Number(collateralAmount) > 0)) {
        setQuotes(null)
        return null
      }

      let outcomeTokenAmountBI = 0n
      if (strategy == 'Buy') {
        outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
          collateralAmountBI,
          outcomeTokenId,
        ])) as bigint
      } else if (strategy == 'Sell') {
        outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
          collateralAmountBI,
          outcomeTokenId,
        ])) as bigint
        // limit max outcome token amount to balance
        const balanceOfOutcomeTokenBI = parseEther(balanceOfOutcomeToken)
        if (outcomeTokenAmountBI > balanceOfOutcomeTokenBI) {
          outcomeTokenAmountBI = balanceOfOutcomeTokenBI
        }
      }

      const outcomeTokenAmount = formatUnits(outcomeTokenAmountBI, 18)
      const outcomeTokenPrice = (Number(collateralAmount) / Number(outcomeTokenAmount)).toString()
      const roi = ((Number(outcomeTokenAmount) / Number(collateralAmount) - 1) * 100).toString()
      const outcomeTokensPriceCurrent =
        strategy == 'Buy' ? outcomeTokensBuyPriceCurrent : outcomeTokensSellPriceCurrent
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
            title={`Successfully invested ${NumberUtil.toFixed(collateralAmount, 6)} ${
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
            title={`Successfully redeemed ${NumberUtil.toFixed(collateralAmount, 6)} ${
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
    return 'Ready'
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
    balanceOfCollateralToSell,
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

export const useTradingService = () => useContext(TradingServiceContext)

export type TradingServiceStatus =
  | 'Disconnected'
  | 'InvalidAmount'
  | 'Ready'
  | 'Submitted'
  | 'Loading'
  | 'Idle'

export type TradeQuotes = {
  outcomeTokenAmount: string // amount of outcome token to be traded based on collateral amount input or ctBalance
  outcomeTokenPrice: string // average cost per outcome token
  roi: string // return on investment aka profitability percentage
  priceImpact: string // price fluctuation percentage
}
