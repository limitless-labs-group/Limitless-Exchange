import {
  collateralToken,
  collateralTokensArray,
  defaultChain,
  markets,
  onChain,
  subgraphURI,
  weth,
} from '@/constants'
import { usePriceOracle } from '@/providers'
import { useEtherspot } from '@/services'
import { Address } from '@/types'
import { NumberUtil } from '@/utils'
import { QueryObserverResult, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'
import { Hash, formatEther, formatUnits } from 'viem'
import { QueryKeys } from '@/constants/query-keys'

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
  const { smartWalletAddress } = useEtherspot()

  /**
   * UTILS
   */
  const { convertTokenAmountToUsd } = usePriceOracle()

  /**
   * QUERIES
   */
  const { data: trades, refetch: getTrades } = useQuery({
    queryKey: [QueryKeys.Trades, smartWalletAddress],
    queryFn: async () => {
      if (!smartWalletAddress) {
        return []
      }

      const response = await axios.request({
        url: subgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `
            query GetAccountTrades(
              $account: String = "${smartWalletAddress}"
              $chainId: Int = ${defaultChain.id}
          ) {
            trades: Trade(
              where: {
                transactor: { _ilike: $account }
                chainId: { _eq: $chainId }
              }
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
      const _trades = response.data.data?.['trades'] as HistoryTrade[]
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

      return _trades.filter((trade) =>
        [weth.symbol, onChain.symbol].includes(trade.market.collateral?.symbol || '')
      )
    },
    enabled: !!smartWalletAddress,
  })

  const { data: redeems, refetch: getRedeems } = useQuery({
    queryKey: [QueryKeys.Redeems, smartWalletAddress],
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
            query GetAccountRedemptions(
              $account: String = "${smartWalletAddress}"
              $chainId: Int = ${defaultChain.id}
            ) {
              ${queryName}: Redemption(
                where: { redeemer: { _ilike: $account }, chainId: { _eq: $chainId } }
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

      return _redeems
    },
  })

  /**
   * Consolidate trades and redeems to get open positions
   */
  const { data: positions, refetch: getPositions } = useQuery({
    queryKey: [QueryKeys.Positions, trades, redeems],
    queryFn: async () => {
      let _positions: HistoryPosition[] = []

      trades?.forEach((trade) => {
        // TODO: replace hardcoded markets with dynamic
        const market = markets.find(
          (market) => market.address[defaultChain.id].toLowerCase() == trade.market.id.toLowerCase()
        )
        if (
          !market ||
          (market.expired && market.winningOutcomeIndex !== trade.outcomeIndex) // TODO: redesign filtering lost positions
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
        (position) => !redeems?.find((redeem) => redeem.conditionId === position.market.conditionId)
      )

      // filter markets with super small balance
      _positions = _positions.filter((position) => Number(position.outcomeTokenAmount) > 0.00001)

      // Todo remove this mapping
      return (
        _positions
          .map((position) => ({
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
          // Todo remove this filter
          .filter((position) =>
            [weth.symbol, onChain.symbol].includes(position.market.collateral.symbol)
          )
      )
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
        positionUsdAmount = convertTokenAmountToUsd(token.symbol, position.collateralAmount)
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
        positionOutcomeUsdAmount = convertTokenAmountToUsd(
          token.symbol,
          position.outcomeTokenAmount
        )
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
  conditionId: Hash
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
