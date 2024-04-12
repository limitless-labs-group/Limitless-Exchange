import { collateralToken, defaultChain, markets, subgraphURI } from '@/constants'
import { useEtherspot } from '@/services'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'
import { QueryObserverResult, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PropsWithChildren, createContext, useCallback, useContext, useMemo } from 'react'
import { formatUnits } from 'viem'

interface IHistoryService {
  trades: HistoryTrade[] | undefined
  getTrades: () => Promise<QueryObserverResult<HistoryTrade[], Error>>
  activeMarkets: HistoryMarketStats[] | undefined
  getActiveMarkets: () => Promise<QueryObserverResult<HistoryMarketStats[], Error>>
  balanceInvested: number
  balanceToWin: number
  getMarketSharesBalance: (market: Market, outcomeId: number) => Promise<number>
}

const HistoryServiceContext = createContext({} as IHistoryService)

export const useHistory = () => useContext(HistoryServiceContext)

export const HistoryServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * ACCOUNT
   */
  const { smartWalletAddress } = useEtherspot()

  /**
   * QUERIES
   */
  const { data: trades, refetch: getTrades } = useQuery({
    queryKey: ['trades', smartWalletAddress],
    queryFn: async () => {
      if (!smartWalletAddress) {
        return []
      }
      const queryName = 'trades'
      const res = await axios.request({
        url: subgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `
            query ${queryName} {
              ${queryName} (
                where: {transactor: "${smartWalletAddress}"}
              ) {
                market {
                  id
                  closed
                  funding
                }
                outcomeTokenAmounts
                outcomeTokenNetCost
                outcomeMarginalPrice
                blockTimestamp
              }
            }
          `,
        },
      })
      const trades = res.data.data?.[queryName] as HistoryTrade[]
      trades.map((trade) => {
        const outcomeTokenAmountBI = BigInt(
          trade.outcomeTokenAmounts.find((amount) => BigInt(amount) != 0n) ?? 0
        )
        trade.sharesAmount = formatUnits(outcomeTokenAmountBI, collateralToken.decimals)
        trade.strategy = Number(trade.sharesAmount) > 0 ? 'Buy' : 'Sell'
        trade.outcomeId = trade.outcomeTokenAmounts.findIndex((amount) => BigInt(amount) != 0n)
        trade.netCostUsd = formatUnits(BigInt(trade.outcomeTokenNetCost), collateralToken.decimals)
        trade.costPerShare = NumberUtil.toFixed(
          (Number(trade.netCostUsd) / Number(trade.sharesAmount)) * 100,
          2
        )
        const totalMargin = 18.446 // ? contract constant
        trade.outcomePercent =
          (Number(formatUnits(trade.outcomeMarginalPrice, 18)) / totalMargin) * 100
        // trade.sharePrice = formatUnits((BigInt(trade.netCostUsd) / outcomeTokenAmountBI) * 100n, 0)
      })
      trades.sort((tradeA, tradeB) => Number(tradeB.blockTimestamp) - Number(tradeA.blockTimestamp))
      console.log('trades', trades)
      return trades
    },
    enabled: !!smartWalletAddress,
  })

  const { data: activeMarkets, refetch: getActiveMarkets } = useQuery({
    queryKey: ['activeMarkets', trades],
    queryFn: async () => {
      let _activeMarkets: HistoryMarketStats[] = []
      trades?.forEach((trade) => {
        const existingMarket = _activeMarkets.find(
          (marketStats) =>
            marketStats.market.id == trade.market.id && marketStats.outcomeId == trade.outcomeId
        )
        const market = existingMarket ?? { market: trade.market, outcomeId: trade.outcomeId }
        market.latestTrade = trade
        market.investedUsd = (Number(market.investedUsd ?? 0) + Number(trade.netCostUsd)).toString()
        market.sharesAmount = (
          Number(market.sharesAmount ?? 0) + Number(trade.sharesAmount)
        ).toString()
        // market.costPerShareNow = await
        // market.balanceUsd = market.costPerShareNow * market.sharesAmount
        if (!existingMarket) {
          _activeMarkets.push(market)
        }
      })
      _activeMarkets = _activeMarkets.filter((market) => Number(market.investedUsd) > 0)
      return _activeMarkets
    },
  })

  /**
   * BALANCES
   */
  const balanceInvested = useMemo(() => {
    let _balanceUsd = 0
    activeMarkets?.forEach((marketStats) => {
      if (
        markets.find(
          (market) => market.address[defaultChain.id].toLowerCase() == marketStats.market.id
        )?.closed
      ) {
        return
      }
      _balanceUsd += Number(marketStats.investedUsd ?? 0)
    })
    return _balanceUsd
  }, [activeMarkets])

  const balanceToWin = useMemo(() => {
    let _balanceShares = 0
    activeMarkets?.forEach((marketStats) => {
      if (
        markets.find(
          (market) => market.address[defaultChain.id].toLowerCase() == marketStats.market.id
        )?.closed
      ) {
        return
      }
      _balanceShares += Number(marketStats.sharesAmount ?? 0)
    })
    return _balanceShares
  }, [activeMarkets])

  const getMarketSharesBalance = useCallback(
    async (market: Market, outcomeId: number) => {
      let _balanceShares = 0
      const _trades = trades ?? (await getTrades()).data
      _trades?.forEach((trade) => {
        if (
          trade.market.id.toLowerCase() != market.address[defaultChain.id]?.toLowerCase() ||
          trade.outcomeId != outcomeId
        )
          return
        _balanceShares += Number(trade.sharesAmount ?? 0)
      })
      console.log('getMarketSharesBalance', market, outcomeId, trades, _balanceShares)
      return _balanceShares
    },
    [trades]
  )

  const contextProviderValue: IHistoryService = {
    trades,
    getTrades,
    activeMarkets,
    getActiveMarkets,
    balanceInvested,
    balanceToWin,
    getMarketSharesBalance,
  }

  return (
    <HistoryServiceContext.Provider value={contextProviderValue}>
      {children}
    </HistoryServiceContext.Provider>
  )
}

export type HistoryTrade = {
  market: HistoryMarket
  strategy?: 'Buy' | 'Sell'
  outcomeId?: number
  outcomeTokenAmounts: string[]
  sharesAmount?: string
  costPerShare?: string
  outcomeTokenNetCost: string
  outcomeMarginalPrice: bigint
  outcomePercent?: number
  netCostUsd?: string
  blockTimestamp: string
}

export type HistoryMarket = {
  id: Address
  paused?: boolean
  closed?: boolean
  funding?: string
  holdersCount: number
}

export type HistoryMarketStats = {
  market: HistoryMarket
  outcomeId?: number
  sharesAmount?: string
  investedUsd?: string
  costPerShareNow?: string
  balanceUsd?: string
  latestTrade?: HistoryTrade
}
