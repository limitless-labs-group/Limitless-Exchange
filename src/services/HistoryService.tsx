import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { Hash } from 'viem'
import useClient from '@/hooks/use-client'
import { usePriceOracle } from '@/providers'
import { useAccount } from '@/services/AccountService'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useLimitlessApi } from '@/services/LimitlessApi'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'

interface IHistoryService {
  positions: (HistoryPositionWithType | ClobPositionWithType)[] | undefined
  balanceInvested: string
  balanceToWin: string
  tradesAndPositionsLoading: boolean
}

const HistoryServiceContext = createContext({} as IHistoryService)

export const useHistory = () => useContext(HistoryServiceContext)

export const HistoryServiceProvider = ({ children }: PropsWithChildren) => {
  const { convertAssetAmountToUsd } = usePriceOracle()
  const { supportedTokens } = useLimitlessApi()
  const { data: positions, isPending: isPositionsLoading } = usePosition()

  /**
   * BALANCES
   */
  const balanceInvested = useMemo(() => {
    const ammPositions = positions?.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.filter(
      (position) => position.type === 'clob'
    ) as ClobPositionWithType[]
    let _balanceInvested = 0
    ammPositions?.forEach((position) => {
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
    const ammPositions = positions?.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.filter(
      (position) => position.type === 'clob'
    ) as ClobPositionWithType[]
    ammPositions?.forEach((position) => {
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

  const tradesAndPositionsLoading = isPositionsLoading

  const contextProviderValue: IHistoryService = {
    positions,
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

export const usePosition = () => {
  const { profileData, web3Wallet } = useAccount()
  const { isLogged } = useClient()
  const privateClient = useAxiosPrivateClient()

  return useQuery({
    queryKey: ['positions', web3Wallet?.account?.address],
    queryFn: async () => {
      try {
        const response = await privateClient.get<PositionsResponse>(`/portfolio/positions`)
        return [
          ...response.data.amm.map((position) => ({ ...position, type: 'amm' })),
          ...response.data.clob.map((position) => ({ ...position, type: 'clob' })),
        ] as (HistoryPositionWithType | ClobPositionWithType)[]

        // return response.data
      } catch (error) {
        console.error('Error fetching positions:', error)
        return []
      }
    },
    enabled: !!isLogged,
    refetchInterval: !!profileData?.id ? 60000 : false, // 1 minute. needs to show red dot in portfolio tab when user won
  })
}

export const usePortfolioHistory = (page: number) => {
  const privateClient = useAxiosPrivateClient()
  return useQuery({
    queryKey: ['history', page],
    queryFn: async (): Promise<AxiosResponse<History>> => {
      return privateClient.get<History>('/portfolio/history', {
        params: {
          page: page,
          limit: 10,
        },
      })
    },
  })
}

export const useInfinityHistory = () => {
  const privateClient = useAxiosPrivateClient()
  const { web3Wallet } = useAccount()
  return useInfiniteQuery<History[], Error>({
    queryKey: ['history-infinity'],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      if (!web3Wallet) {
        return []
      }

      const response = await privateClient.get<History[]>(
        '/portfolio/history',

        {
          params: {
            page: pageParam,
            limit: 30,
          },
        }
      )
      return { data: response.data, next: (pageParam as number) + 1 }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // @ts-ignore
      return lastPage.data?.data?.length === 30 ? lastPage.next : null
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!web3Wallet,
  })
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
    id: string
  }
  expirationDate: string
  title: string
  slug: string | null
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
  collateralSymbol: string
  title: string
}

export type History = {
  data: HistoryPosition[] | HistoryRedeem[]
  totalCount: number
}

export type HistoryPosition = {
  market: HistoryMarket
  outcomeIndex: number
  outcomeTokenAmount?: string
  collateralAmount?: string // collateral amount invested
  latestTrade?: HistoryTrade
  outcomeTokenAmounts?: (string | number)[]
  outcomeTokenPrice?: string
  strategy?: 'Buy' | 'Sell'
}

type PositionsResponse = {
  amm: HistoryPositionWithType[]
  clob: ClobPositionWithType[]
}

export type ClobPosition = {
  latestTrade: {
    tradeId: string
    marketId: string
    ownerId: number
    createdAt: string
    role: string
  }[]
  market: Market
  tokensBalance: {
    yes: string
    no: string
  }
}

export type HistoryPositionWithType = HistoryPosition & {
  type: 'amm'
}

export type ClobPositionWithType = ClobPosition & {
  type: 'clob'
}
