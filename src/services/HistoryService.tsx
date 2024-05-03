import { collateralToken, defaultChain, markets, subgraphURI } from '@/constants'
import { useEtherspot } from '@/services'
import { Address } from '@/types'
import { QueryObserverResult, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'
import { Hash, formatEther, formatUnits } from 'viem'

interface IHistoryService {
  trades: HistoryTrade[] | undefined
  getTrades: () => Promise<QueryObserverResult<HistoryTrade[], Error>>
  redeems: HistoryRedeem[] | undefined
  getRedeems: () => Promise<QueryObserverResult<HistoryRedeem[], Error>>
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
      const response = await axios.request({
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
                  conditionId
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
      const _trades = response.data.data?.[queryName] as HistoryTrade[]
      _trades.map((trade) => {
        const outcomeTokenAmountBI = BigInt(
          trade.outcomeTokenAmounts.find((amount) => BigInt(amount) != 0n) ?? 0
        )
        trade.outcomeTokenAmount = formatEther(outcomeTokenAmountBI)
        trade.strategy = Number(trade.outcomeTokenAmount) > 0 ? 'Buy' : 'Sell'
        trade.outcomeIndex = trade.outcomeTokenAmounts.findIndex((amount) => BigInt(amount) != 0n)
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

  const { data: redeems, refetch: getRedeems } = useQuery({
    queryKey: ['redeems', smartWalletAddress],
    queryFn: async () => {
      if (!smartWalletAddress) {
        return []
      }

      const queryName = 'payoutRedemptions'
      const response = await axios.request({
        url: subgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `
            query ${queryName} {
              ${queryName} (
                where: {redeemer: "${smartWalletAddress}"}
              ) {
                payout
                conditionId
                indexSets
                blockTimestamp
                transactionHash
              }
            }
          `,
        },
      })
      const _redeems = response.data.data?.[queryName] as HistoryRedeem[]
      _redeems.map((redeem) => {
        redeem.collateralAmount = formatUnits(BigInt(redeem.payout), collateralToken.decimals)
        redeem.outcomeIndex = redeem.indexSets[0] == '1' ? 0 : 1
      })

      _redeems.sort(
        (redeemA, redeemB) => Number(redeemB.blockTimestamp) - Number(redeemA.blockTimestamp)
      )
      console.log('redeems', _redeems)

      return _redeems
    },
  })

  /**
   * Consolidate trades and redeems to get open positions
   */
  const { data: positions, refetch: getPositions } = useQuery({
    queryKey: ['positions', trades, redeems],
    queryFn: async () => {
      let _positions: HistoryPosition[] = []

      trades?.forEach((trade) => {
        // TODO: replace hardcoded markets with dynamic
        const market = markets.find(
          (market) => market.address[defaultChain.id].toLowerCase() == trade.market.id.toLowerCase()
        )
        if (
          !market ||
          ((market.expired || window?.location.href.includes('?expired=true')) &&
            market.winningOutcomeIndex !== trade.outcomeIndex) // TODO: redesign filtering lost positions
        ) {
          return
        }

        const existingMarket = _positions.find(
          (position) =>
            position.market.id == trade.market.id && position.outcomeIndex == trade.outcomeIndex
        )
        const position = existingMarket ?? {
          market: trade.market,
          outcomeIndex: trade.outcomeIndex,
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

      redeems?.forEach((redeem) => {
        const position = _positions.find(
          (position) =>
            position.market.conditionId === redeem.conditionId &&
            position.outcomeIndex == redeem.outcomeIndex
        )
        if (!position) {
          return
        }
        position.collateralAmount = (
          Number(position.collateralAmount ?? 0) - Number(redeem.collateralAmount)
        ).toString()
        position.outcomeTokenAmount = (
          Number(position.outcomeTokenAmount ?? 0) - Number(redeem.collateralAmount)
        ).toString()
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
    redeems,
    getRedeems,
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
  outcomeIndex: number
  outcomeTokenAmounts: string[]
  outcomeTokenAmount?: string // outcome token amount traded
  outcomeTokenPrice?: string // collateral per outcome token
  outcomeTokenNetCost: string
  // outcomePercent?: number // 50% yes / 50% no
  collateralAmount?: string // collateral amount traded
  blockTimestamp: string
  transactionHash: Hash
}

export type HistoryMarket = {
  id: Address
  conditionId: Hash
  paused?: boolean
  closed?: boolean
  funding?: string
  holdersCount: number
}

export type HistoryRedeem = {
  payout: string // collateral amount raw
  collateralAmount: string // collateral amount formatted
  conditionId: Hash
  indexSets: string[] // ["1"] for Yes
  outcomeIndex: number
  blockTimestamp: string
  transactionHash: Hash
}

export type HistoryPosition = {
  market: HistoryMarket
  outcomeIndex: number
  outcomeTokenAmount?: string
  collateralAmount?: string // collateral amount invested
  latestTrade?: HistoryTrade
}
