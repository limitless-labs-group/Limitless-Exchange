import { collateralToken, defaultChain, markets, subgraphURI } from '@/constants'
import { useEtherspot } from '@/services'
import { Address } from '@/types'
import { QueryObserverResult, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PropsWithChildren, createContext, useCallback, useContext, useMemo } from 'react'
import { formatEther, formatUnits } from 'viem'

interface IHistoryService {
  trades: HistoryTrade[] | undefined
  getTrades: () => Promise<QueryObserverResult<HistoryTrade[], Error>>
  positions: HistoryPosition[] | undefined
  getPositions: () => Promise<QueryObserverResult<HistoryPosition[], Error>>
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

        // trade.outcomePercent = Number(trade.outcomeTokenPrice)
      })

      _trades.sort(
        (tradeA, tradeB) => Number(tradeB.blockTimestamp) - Number(tradeA.blockTimestamp)
      )
      console.log('trades', _trades)

      return _trades
    },
    enabled: !!smartWalletAddress,
  })

  const { data: positions, refetch: getPositions } = useQuery({
    queryKey: ['positions', trades],
    queryFn: async () => {
      let _positions: HistoryPosition[] = []
      trades?.forEach((trade) => {
        // TODO: replace hardcoded markets and close logic with dynamic
        const market = markets.find(
          (market) => market.address[defaultChain.id].toLowerCase() == trade.market.id.toLowerCase()
        )
        if (!market || market.closed) {
          return
        }

        const existingMarket = _positions.find(
          (position) =>
            position.market.id == trade.market.id && position.outcomeTokenId == trade.outcomeTokenId
        )
        const position = existingMarket ?? {
          market: trade.market,
          outcomeTokenId: trade.outcomeTokenId,
        }
        position.latestTrade = trade
        position.collateralAmount = (
          Number(position.collateralAmount ?? 0) + Number(trade.collateralAmount)
        ).toString()
        position.outcomeTokenAmount = (
          Number(position.outcomeTokenAmount ?? 0) + Number(trade.outcomeTokenAmount)
        ).toString()
        if (!existingMarket) {
          _positions.push(position)
        }
      })

      // filter markets with super small balance
      _positions = _positions.filter((market) => Number(market.outcomeTokenAmount) > 0.00001)
      console.log('positions', _positions)

      return _positions
    },
  })

  /**
   * BALANCES
   */
  const balanceInvested = useMemo(() => {
    let _balanceInvested = 0
    positions?.forEach((position) => {
      _balanceInvested += Number(position.collateralAmount ?? 0)
    })
    return _balanceInvested
  }, [positions])

  const balanceToWin = useMemo(() => {
    let _balanceToWin = 0
    positions?.forEach((position) => {
      _balanceToWin += Number(position.outcomeTokenAmount ?? 0)
    })
    return _balanceToWin
  }, [positions])

  const contextProviderValue: IHistoryService = {
    trades,
    getTrades,
    positions,
    getPositions,
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
  // outcomePercent?: number // 50% yes / 50% no
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

export type HistoryPosition = {
  market: HistoryMarket
  outcomeTokenId?: number
  outcomeTokenAmount?: string
  collateralAmount?: string // collateral amount invested
  latestTrade?: HistoryTrade
}
