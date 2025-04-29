import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { formatUnits, Hash } from 'viem'
import useClient from '@/hooks/use-client'
import { usePriceOracle } from '@/providers'
import { useAccount } from '@/services/AccountService'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useLimitlessApi } from '@/services/LimitlessApi'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'

interface IHistoryService {
  positions?: PortfolioPositions
  balanceInvested: string
  balanceToWin: string
  tradesAndPositionsLoading: boolean
}

const HistoryServiceContext = createContext({} as IHistoryService)

export const useHistory = () => useContext(HistoryServiceContext)

export const HistoryServiceProvider = ({ children }: PropsWithChildren) => {
  const { convertAssetAmountToUsd } = usePriceOracle()
  const { supportedTokens } = useLimitlessApi()
  const { data: positions, isLoading: isPositionsLoading } = usePosition()

  /**
   * BALANCES
   */
  const balanceInvested = useMemo(() => {
    const ammPositions = positions?.positions.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.positions.filter(
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
    const ammPositions = positions?.positions.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.positions.filter(
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

const removeSmallClobPositions = (positions: ClobPosition[]) => {
  return positions.filter((position) => {
    const decimals = position.market.collateralToken.decimals
    const yesAmount = formatUnits(BigInt(position.tokensBalance.yes), decimals)
    const noAmount = formatUnits(BigInt(position.tokensBalance.no), decimals)
    const ordersPlaced = !!position.orders.liveOrders.length
    return !(+yesAmount < 0.01 && +noAmount < 0.01 && !ordersPlaced)
  })
}

const prepareClobPositions = (positions: ClobPosition[]) => {
  const filtered = removeSmallClobPositions(positions)
  return filtered.map((position) => {
    const decimals = position.market.collateralToken.decimals
    const yesAmount = formatUnits(BigInt(position.tokensBalance.yes), decimals)
    const noAmount = formatUnits(BigInt(position.tokensBalance.no), decimals)
    return {
      ...position,
      tokensBalance: {
        yes: +yesAmount < 0.01 ? '0' : position.tokensBalance.yes,
        no: +noAmount < 0.01 ? '0' : position.tokensBalance.no,
      },
      type: 'clob',
    }
  })
}

export const usePosition = () => {
  const { web3Wallet } = useAccount()
  const { isLogged } = useClient()
  const privateClient = useAxiosPrivateClient()

  return useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      try {
        const response = await privateClient.get<PositionsResponse>(`/portfolio/positions`)
        // const response = positionsMock
        const ammPositions = response.data.amm.map((position) => ({ ...position, type: 'amm' }))
        const filteredClobPositions = prepareClobPositions(response.data.clob)
        return {
          ...response.data,
          positions: [...ammPositions, ...filteredClobPositions],
        } as PortfolioPositions

        // return response.data
      } catch (error) {
        console.error('Error fetching positions:', error)
        return {
          rewards: {
            totalUserRewardsLastEpoch: '0',
            totalUnpaidRewards: '0',
            rewardsByEpoch: [],
          },
          positions: [],
          points: '0.00',
        }
      }
    },
    enabled: !!isLogged,
    refetchInterval: () => {
      if (!web3Wallet) {
        return false
      }
      return 60000
    },
  })
}

export const useInfinityHistory = () => {
  const privateClient = useAxiosPrivateClient()
  const { account } = useAccount()
  return useInfiniteQuery<History[], Error>({
    queryKey: ['history-infinity'],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      if (!account) {
        return []
      }

      const response = await privateClient.get<History[]>(
        '/portfolio/history',

        {
          params: {
            page: pageParam,
            limit: 100,
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
    enabled: !!account,
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
  group?: {
    slug: string
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
  collateralSymbol: string
  title: string
  action: HistoryAction
}

export enum HistoryAction {
  WON = 'won',
  LOOS = 'loss',
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

interface RewardEpoch {
  epochId: number
  timestamp: string
  userRewards: string
  totalRewards: string
  earnedPercent: number
}

type PositionsResponse = {
  rewards: {
    totalUnpaidRewards: string
    totalUserRewardsLastEpoch: string
    rewardsByEpoch: RewardEpoch[]
  }
  points: string
  amm: HistoryPositionWithType[]
  clob: ClobPositionWithType[]
}

type PortfolioPositions = {
  rewards: {
    totalUnpaidRewards: string
    totalUserRewardsLastEpoch: string
    rewardsByEpoch: RewardEpoch[]
  }
  positions: (HistoryPositionWithType | ClobPositionWithType)[]
  points: string
}

export interface ClobPositionContracts {
  cost: string
  fillPrice: string
  realisedPnl: string
  unrealizedPnl: string
  marketValue: string
}

export interface ClobContractsInMarket {
  yes: ClobPositionContracts
  no: ClobPositionContracts
}

export interface LiveOrder {
  createdAt: string
  id: string
  ownerId: number
  marketId: string
  token: string
  type: string
  status: string
  side: 'BUY' | 'SELL'
  makerAmount: string
  takerAmount: string
  price: string
  originalSize: string
  remainingSize: string
  isEarning: boolean
}

export type ClobPosition = {
  market: Market
  tokensBalance: { yes: string; no: string }
  positions: ClobContractsInMarket
  latestTrade: { latestYesPrice: number; latestNoPrice: number } | null
  orders: {
    totalCollateralLocked: string
    liveOrders: LiveOrder[]
  }
  rewards: {
    isEarning?: true
    epochs: RewardEpoch[]
  }
}

export type HistoryPositionWithType = HistoryPosition & {
  type: 'amm'
}

export type ClobPositionWithType = ClobPosition & {
  type: 'clob'
}

export type HistoryLoss = {
  action: HistoryAction
  title: string
  conditionId: Hash
  outcomeIndex: number
  blockTimestamp: string
  collateralToken: string
  collateralSymbol: string
  collateralAmount: string
}
