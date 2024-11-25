import { QueryObserverResult, useQuery } from '@tanstack/react-query'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'
import { Hash } from 'viem'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { usePriceOracle } from '@/providers'
import { useLimitlessApi } from '@/services/LimitlessApi'
import { Address } from '@/types'
import { NumberUtil } from '@/utils'

interface IHistoryService {
  trades: HistoryTrade[] | undefined
  getTrades: () => Promise<QueryObserverResult<HistoryTrade[], Error>>
  redeems: HistoryRedeem[] | undefined
  getRedeems: () => Promise<QueryObserverResult<HistoryRedeem[], Error>>
  positions: HistoryPosition[] | undefined
  getPositions: () => Promise<QueryObserverResult<HistoryPosition[], Error>>
  balanceInvested: string
  balanceToWin: string
  tradesAndPositionsLoading: boolean
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

  const { supportedTokens } = useLimitlessApi()

  /**
   * QUERIES
   */
  const {
    data: trades,
    refetch: getTrades,
    isLoading: tradesLoading,
  } = useQuery({
    queryKey: ['trades', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return []
      }
      try {
        const response = await privateClient.get<HistoryTrade[]>(`/portfolio/trades`)
        return response.data
      } catch (error) {
        console.error('Error fetching trades:', error)
        return []
      }
    },
    enabled: !!walletAddress && !!supportedTokens?.length,
  })

  const {
    data: redeems,
    refetch: getRedeems,
    isLoading: redeemsLoading,
  } = useQuery({
    queryKey: ['redeems', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return []
      }
      try {
        const response = await privateClient.get<HistoryRedeem[]>(`/portfolio/redeems`)
        return response.data
      } catch (error) {
        console.error('Error fetching redeems:', error)
        return []
      }
    },
  })

  // Todo change to useMemo
  /**
   * Consolidate trades and redeems to get open positions
   */
  const {
    data: positions,
    refetch: getPositions,
    isLoading: positionsLoading,
  } = useQuery({
    queryKey: ['positions', trades, redeems],
    queryFn: async () => {
      let _positions: HistoryPosition[] = []

      try {
        const response = await privateClient.get<HistoryPosition[]>(`/portfolio/positions`)
        return response.data
      } catch (error) {
        console.error('Error fetching positions:', error)
        return []
      }

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

      // filter markets with super small balance
      _positions = _positions.filter((position) => Number(position.outcomeTokenAmount) > 0.00001)

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
    enabled: !!walletAddress && !!markets.length && !!trades,
  })

  /**
   * BALANCES
   */
  const balanceInvested = useMemo(() => {
    let _balanceInvested = 0
    positions?.forEach((position) => {
      let positionUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateral?.symbol
      )
      if (!!token) {
        positionUsdAmount = convertAssetAmountToUsd(token.priceOracleId, position.collateralAmount)
      }
      _balanceInvested += positionUsdAmount
    })
    return NumberUtil.toFixed(_balanceInvested, 2)
  }, [positions])

  const balanceToWin = useMemo(() => {
    let _balanceToWin = 0
    positions?.forEach((position) => {
      let positionOutcomeUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateral?.symbol
      )
      if (!!token) {
        positionOutcomeUsdAmount = convertAssetAmountToUsd(
          token.priceOracleId,
          position.outcomeTokenAmount
        )
      }
      _balanceToWin += positionOutcomeUsdAmount
    })
    return NumberUtil.toFixed(_balanceToWin, 2)
  }, [positions])

  const tradesAndPositionsLoading = tradesLoading || redeemsLoading || positionsLoading

  const contextProviderValue: IHistoryService = {
    trades,
    getTrades,
    redeems,
    getRedeems,
    positions,
    getPositions,
    balanceInvested,
    balanceToWin,
    tradesAndPositionsLoading,
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
  collateralToken: string
}

export type HistoryPosition = {
  market: HistoryMarket
  outcomeIndex: number
  outcomeTokenAmount?: string
  collateralAmount?: string // collateral amount invested
  latestTrade?: HistoryTrade
}
