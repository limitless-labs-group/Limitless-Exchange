import { collateralToken, defaultChain, markets, subgraphURI } from '@/constants'
import { useEtherspot } from '@/services'
import { Address } from '@/types'
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
  getCollateralBalance: (marketAddress: Address, outcomeTokenId: number) => Promise<string>
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
        trade.outcomeTokenAmount = formatUnits(outcomeTokenAmountBI, collateralToken.decimals)
        trade.strategy = Number(trade.outcomeTokenAmount) > 0 ? 'Buy' : 'Sell'
        trade.outcomeTokenId = trade.outcomeTokenAmounts.findIndex((amount) => BigInt(amount) != 0n)
        trade.collateralAmount = formatUnits(
          BigInt(trade.outcomeTokenNetCost),
          collateralToken.decimals
        )
        trade.outcomeTokenPrice = (
          Number(trade.collateralAmount) / Number(trade.outcomeTokenAmount)
        ).toString()
        trade.outcomePercent = Number(trade.outcomeTokenPrice) * 100
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
        // TODO: replace hardcoded markets and close logic with dynamic
        if (
          markets.find(
            (market) =>
              market.address[defaultChain.id].toLowerCase() == trade.market.id.toLowerCase()
          )?.closed
        ) {
          return
        }

        const existingMarket = _activeMarkets.find(
          (marketStats) =>
            marketStats.market.id == trade.market.id &&
            marketStats.outcomeTokenId == trade.outcomeTokenId
        )
        const market = existingMarket ?? {
          market: trade.market,
          outcomeTokenId: trade.outcomeTokenId,
        }
        market.latestTrade = trade
        market.collateralAmount = (
          Number(market.collateralAmount ?? 0) + Number(trade.collateralAmount)
        ).toString()
        market.outcomeTokenAmount = (
          Number(market.outcomeTokenAmount ?? 0) + Number(trade.outcomeTokenAmount)
        ).toString()
        // market.costPerShareNow = await
        // market.balanceUsd = market.costPerShareNow * market.sharesAmount
        if (!existingMarket) {
          _activeMarkets.push(market)
        }
      })
      _activeMarkets = _activeMarkets.filter((market) => Number(market.collateralAmount) > 0)
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
    let _balanceShares = 0
    activeMarkets?.forEach((marketStats) => {
      _balanceShares += Number(marketStats.outcomeTokenAmount ?? 0)
    })
    return _balanceShares
  }, [activeMarkets])

  /**
   * Calculates the amount of collateral token invested by the user into a market for a particular outcome token ID, based on the subgraph data.
   *
   * @param {Address} marketAddress - The address of the market.
   * @param {number} outcomeTokenId - ID of the outcome token (eg. 0 for Yes, 1 for No)
   *
   * @returns {string} The formatted amount of collateral token invested into market for selected outcome token id.
   */
  const getCollateralBalance = useCallback(
    async (marketAddress: Address, outcomeTokenId: number) => {
      let collateralBalance = 0
      const _trades = trades ?? (await getTrades()).data
      _trades?.forEach((trade) => {
        if (
          trade.market.id.toLowerCase() != marketAddress.toLowerCase() ||
          trade.outcomeTokenId != outcomeTokenId
        ) {
          return
        }
        collateralBalance += Number(trade.collateralAmount ?? 0)
      })
      console.log('getCollateralBalance', marketAddress, outcomeTokenId, trades, collateralBalance)
      return collateralBalance.toString()
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
    getCollateralBalance,
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
