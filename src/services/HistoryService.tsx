import {
  collateralToken,
  collateralTokensArray,
  defaultChain,
  newSubgraphURI,
  onChain,
  vita,
  weth,
} from '@/constants'
import { usePriceOracle } from '@/providers'
import { Address } from '@/types'
import { NumberUtil } from '@/utils'
import { QueryObserverResult, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'
import { Hash, formatEther, formatUnits } from 'viem'
import { useAllMarkets } from '@/services/MarketsService'
import { useWalletAddress } from '@/hooks/use-wallet-address'

interface IHistoryService {
  trades: HistoryTrade[] | undefined
  getTrades: () => Promise<QueryObserverResult<HistoryTrade[], Error>>
  redeems: HistoryRedeem[] | undefined
  getRedeems: () => Promise<QueryObserverResult<HistoryRedeem[], Error>>
  positions: HistoryPosition[] | undefined
  getPositions: () => Promise<QueryObserverResult<HistoryPosition[], Error>>
  balanceInvested: string
  balanceToWin: string
}

const HistoryServiceContext = createContext({} as IHistoryService)

export const useHistory = () => useContext(HistoryServiceContext)

export const HistoryServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * ACCOUNT
   */
  const walletAddress = useWalletAddress()

  /**
   * UTILS
   */
  const { convertAssetAmountToUsd } = usePriceOracle()
  const markets = useAllMarkets()

  /**
   * QUERIES
   */
  const { data: trades, refetch: getTrades } = useQuery({
    queryKey: ['trades', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return []
      }

      const queryName = 'Trade'
      const response = await axios.request({
        url: newSubgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `
            query ${queryName} {
              ${queryName} (
                where: {transactor: { _ilike: "${walletAddress}" } }
              ) {
                market {
                  id
                  closed
                  funding
                  condition_id
                  collateral {
                    symbol
                  }
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
    enabled: !!walletAddress,
  })

  const { data: redeems, refetch: getRedeems } = useQuery({
    queryKey: ['redeems', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return []
      }

      const queryName = 'Redemption'
      const response = await axios.request({
        url: newSubgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `
            query ${queryName} {
              ${queryName} (
                where: {
                  redeemer: {
                    _ilike: "${walletAddress}"
                  } 
                }
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

      _redeems.filter((redeem) => Number(redeem.collateralAmount) > 0)

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
          (market) =>
            market.address[defaultChain.id].toLowerCase() === trade.market.id.toLowerCase()
        )

        if (
          !market ||
          (market.expired && market.winningOutcomeIndex !== trade.outcomeIndex) // TODO: redesign filtering lost positions
        ) {
          return
        }
        const existingMarket = _positions.find(
          (position) =>
            position.market.id === trade.market.id && position.outcomeIndex === trade.outcomeIndex
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

      // redeems?.forEach((redeem) => {
      //   const position = _positions.find(
      //     (position) =>
      //       position.market.conditionId === redeem.conditionId &&
      //       position.outcomeIndex == redeem.outcomeIndex
      //   )
      //   if (!position) {
      //     return
      //   }
      //   position.collateralAmount = (
      //     Number(position.collateralAmount ?? 0) - Number(redeem.collateralAmount)
      //   ).toString()
      //   position.outcomeTokenAmount = (
      //     Number(position.outcomeTokenAmount ?? 0) - Number(redeem.collateralAmount)
      //   ).toString()
      // })

      // filter redeemed markets
      _positions = _positions.filter(
        (position) =>
          !redeems?.find((redeem) => redeem.conditionId === position.market.condition_id)
      )
      console.log('positions', _positions)

      // filter markets with super small balance
      _positions = _positions.filter((position) => Number(position.outcomeTokenAmount) > 0.00001)
      console.log('positions', _positions)

      // Todo remove this mapping
      return _positions.map((position) => ({
        ...position,
        market: {
          ...position.market,
          collateral: {
            symbol: position.market.collateral?.symbol
              ? position.market.collateral?.symbol
              : 'MFER',
          },
        },
      }))
    },
  })

  /**
   * BALANCES
   */
  const balanceInvested = useMemo(() => {
    let _balanceInvested = 0
    positions?.forEach((position) => {
      let positionUsdAmount = 0
      const token = collateralTokensArray.find(
        (token) => token.symbol === position.market.collateral?.symbol
      )
      if (!!token) {
        positionUsdAmount = convertAssetAmountToUsd(token.id, position.collateralAmount)
      }
      _balanceInvested += positionUsdAmount
    })
    return NumberUtil.toFixed(_balanceInvested, 2)
  }, [positions])

  const balanceToWin = useMemo(() => {
    let _balanceToWin = 0
    positions?.forEach((position) => {
      let positionOutcomeUsdAmount = 0
      const token = collateralTokensArray.find(
        (token) => token.symbol === position.market.collateral?.symbol
      )
      if (!!token) {
        positionOutcomeUsdAmount = convertAssetAmountToUsd(token.id, position.outcomeTokenAmount)
      }
      _balanceToWin += positionOutcomeUsdAmount
    })
    return NumberUtil.toFixed(_balanceToWin, 2)
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
  condition_id: Hash //#TODO align namings to conditionId
  paused?: boolean
  closed?: boolean
  funding?: string
  holdersCount?: number
  collateral?: {
    symbol: string
  }
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
