import { collateralToken, defaultChain, markets, subgraphURI } from '@/constants'
import { useEtherspot } from '@/services'
import { Address } from '@/types'
import { QueryObserverResult, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'
import { formatEther, formatUnits } from 'viem'

interface IHistoryService {
  trades: HistoryTrade[] | undefined
  getTrades: () => Promise<QueryObserverResult<HistoryTrade[], Error>>
  activeMarkets: HistoryMarketStats[] | undefined
  getActiveMarkets: () => Promise<QueryObserverResult<HistoryMarketStats[], Error>>
  balanceInvested: number
  balanceToWin: number
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
                blockTimestamp
                transactionHash
              }
            }
          `,
        },
      })
      const _trades = res.data.data?.[queryName] as HistoryTrade[]
      _trades.map((trade) => {
        const outcomeTokenAmountBI = BigInt(
          trade.outcomeTokenAmounts.find((amount) => BigInt(amount) != 0n) ?? 0
        )
        trade.outcomeTokenAmount = formatEther(outcomeTokenAmountBI)
        trade.strategy = Number(trade.outcomeTokenAmount) > 0 ? 'Buy' : 'Sell'
        trade.outcomeTokenId = trade.outcomeTokenAmounts.findIndex((amount) => BigInt(amount) != 0n)
        trade.collateralAmount = formatUnits(
          BigInt(trade.outcomeTokenNetCost),
          collateralToken.decimals
        )
        trade.outcomeTokenPrice = (
          Number(trade.collateralAmount) / Number(trade.outcomeTokenAmount)
        ).toString()

        trade.outcomePercent = Number(trade.outcomeTokenPrice)
      })

      _trades.sort(
        (tradeA, tradeB) => Number(tradeB.blockTimestamp) - Number(tradeA.blockTimestamp)
      )
      console.log('trades', _trades)

      return _trades
    },
    enabled: !!smartWalletAddress,
  })

  const { data: activeMarkets, refetch: getActiveMarkets } = useQuery({
    queryKey: ['activeMarkets', trades],
    queryFn: async () => {
      let _activeMarkets: HistoryMarketStats[] = []
      trades?.forEach((trade) => {
        // TODO: replace hardcoded markets and close logic with dynamic
        const market = markets.find(
          (market) => market.address[defaultChain.id].toLowerCase() == trade.market.id.toLowerCase()
        )
        if (!market || market.closed) {
          return
        }

        const existingMarket = _activeMarkets.find(
          (marketStats) =>
            marketStats.market.id == trade.market.id &&
            marketStats.outcomeTokenId == trade.outcomeTokenId
        )
        const marketStats = existingMarket ?? {
          market: trade.market,
          outcomeTokenId: trade.outcomeTokenId,
        }
        marketStats.latestTrade = trade
        marketStats.collateralAmount = (
          Number(marketStats.collateralAmount ?? 0) + Number(trade.collateralAmount)
        ).toString()
        marketStats.outcomeTokenAmount = (
          Number(marketStats.outcomeTokenAmount ?? 0) + Number(trade.outcomeTokenAmount)
        ).toString()
        if (!existingMarket) {
          _activeMarkets.push(marketStats)
        }
      })

      // filterin markets with super small balance
      _activeMarkets = _activeMarkets.filter(
        (market) => Number(market.outcomeTokenAmount) > 0.0000001
      )
      console.log('activeMarkets', _activeMarkets)

      return _activeMarkets
    },
  })

  /**
   * BALANCES
   */
  const balanceInvested = useMemo(() => {
    let _balanceInvested = 0
    activeMarkets?.forEach((marketStats) => {
      _balanceInvested += Number(marketStats.collateralAmount ?? 0)
    })
    return _balanceInvested
  }, [activeMarkets])

  const balanceToWin = useMemo(() => {
    let _balanceToWin = 0
    activeMarkets?.forEach((marketStats) => {
      _balanceToWin += Number(marketStats.outcomeTokenAmount ?? 0)
    })
    return _balanceToWin
  }, [activeMarkets])

  const contextProviderValue: IHistoryService = {
    trades,
    getTrades,
    activeMarkets,
    getActiveMarkets,
    balanceInvested,
    balanceToWin,
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
  outcomeTokenId?: number
  outcomeTokenAmounts: string[]
  outcomeTokenAmount?: string // outcome token amount traded
  outcomeTokenPrice?: string // collateral per outcome token
  outcomeTokenNetCost: string
  outcomePercent?: number // 50% yes / 50% no
  collateralAmount?: string // collateral amount traded
  blockTimestamp: string
  transactionHash: string
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
  outcomeTokenId?: number
  outcomeTokenAmount?: string
  collateralAmount?: string // collateral amount invested
  latestTrade?: HistoryTrade
}
