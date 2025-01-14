import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { Hash } from 'viem'
import useClient from '@/hooks/use-client'
import { useAccount } from '@/services/AccountService'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { Address } from '@/types'

export const usePosition = () => {
  const { profileData } = useAccount()
  const { isLogged } = useClient()
  const privateClient = useAxiosPrivateClient()

  return useQuery({
    queryKey: ['positions', profileData?.id],
    queryFn: async () => {
      if (!profileData) {
        return []
      }
      try {
        const response = await privateClient.get<HistoryPosition[]>(`/portfolio/positions`)
        return response.data
      } catch (error) {
        console.error('Error fetching positions:', error)
        return []
      }
    },
    enabled: !!profileData?.id && !!isLogged,
    refetchInterval: !!profileData?.id ? 60000 : false, // 1 minute. needs to show red dot in portfolio tab when user won
  })
}

export const usePortfolioHistory = (page: number) => {
  const privateClient = useAxiosPrivateClient()
  return useQuery({
    queryKey: ['history', page],
    queryFn: async (): Promise<AxiosResponse<History>> => {
      return privateClient.get<History>(
        '/portfolio/history',

        {
          params: {
            page: page,
            limit: 10,
          },
        }
      )
    },
  })
}

export const useInfinityHistory = () => {
  const privateClient = useAxiosPrivateClient()
  const { checkIsLogged } = useClient()
  const { profileData } = useAccount()
  return useInfiniteQuery<History[], Error>({
    queryKey: ['history-infinity'],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const isLogged = checkIsLogged()

      if (!isLogged) {
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
      return lastPage.data.data.length === 30 ? lastPage.next : null
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!profileData?.id,
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
}
