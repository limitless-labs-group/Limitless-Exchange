import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { Address, formatUnits, getContract, parseUnits } from 'viem'
import { defaultChain, newSubgraphURI } from '@/constants'
import { LIMIT_PER_PAGE, POLLING_INTERVAL } from '@/constants/application'
import { fixedProductMarketMakerABI } from '@/contracts'
import { publicClient } from '@/providers/Privy'
import { useAccount } from '@/services/AccountService'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import {
  ApiResponse,
  Category,
  Market,
  MarketPage,
  MarketRewardsResponse,
  MarketSortOption,
  OddsData,
} from '@/types'
import { calculateMarketPrice, getPrices } from '@/utils/market'

type UseMarketsOptions = {
  categoryId?: number | null
  enabled?: boolean
  sortBy?: MarketSortOption | null
  customHeaders?: Record<string, string>
}

export function useActiveMarkets({
  categoryId,
  enabled = true,
  sortBy = null,
  customHeaders = {},
}: UseMarketsOptions) {
  return useInfiniteQuery<MarketPage, Error>({
    queryKey: ['markets', categoryId, sortBy, customHeaders],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`
      const marketBaseUrl = categoryId ? `${baseUrl}/${categoryId}` : baseUrl

      const hasIgnoreLimitsHeader = 'x-ignore-limits' in customHeaders

      const params = hasIgnoreLimitsHeader
        ? {}
        : {
            page: pageParam,
            limit: LIMIT_PER_PAGE,
            ...(sortBy ? { sortBy } : {}),
          }

      try {
        const { data: response }: AxiosResponse<ApiResponse> = await axios.get(marketBaseUrl, {
          params,
          headers: { ...customHeaders },
        })

        const ammMarkets = response.data.filter((market) => market.tradeType === 'amm')

        const marketDataForMultiCall = ammMarkets.map((market) => ({
          address: market.address as Address,
          decimals: market.collateralToken?.decimals || 18,
        }))

        const pricesResult =
          marketDataForMultiCall.length > 0 ? await getPrices(marketDataForMultiCall) : []

        const _markets = new Map<`0x${string}`, OddsData>(
          pricesResult.map((item) => [item.address, { prices: item.prices }])
        )

        const result = response.data.map((market) => ({
          ...market,
          prices:
            market.tradeType === 'amm'
              ? _markets.get(market.address as `0x${string}`)?.prices || [50, 50]
              : [
                  calculateMarketPrice(market?.prices?.[0]),
                  calculateMarketPrice(market?.prices?.[1]),
                ],
        }))

        return {
          data: {
            markets: result,
            totalAmount: response.totalMarketsCount || 0,
          },
          next: (pageParam as number) + 1,
        }
      } catch (error) {
        console.error('Error fetching markets:', error)
        return {
          data: {
            markets: [],
            totalAmount: 0,
          },
          next: (pageParam as number) + 1,
        }
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if ('x-ignore-limits' in customHeaders) return null
      return lastPage.data.totalAmount < LIMIT_PER_PAGE ? null : lastPage.next
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useMarkets(topic: Category | null, enabled = true, customHeaders = {}) {
  return useInfiniteQuery<MarketPage, Error>({
    queryKey: ['markets', topic?.id, customHeaders],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`
      const marketBaseUrl = topic?.id ? `${baseUrl}/${topic?.id}` : baseUrl

      const hasIgnoreLimitsHeader = 'x-ignore-limits' in customHeaders
      const params = hasIgnoreLimitsHeader
        ? {}
        : {
            page: pageParam,
            limit: LIMIT_PER_PAGE,
          }

      const { data: response }: AxiosResponse<ApiResponse> = await axios.get(marketBaseUrl, {
        params,
        headers: { ...customHeaders },
      })

      const ammMarkets = response.data.filter((market) => market.tradeType === 'amm')

      const marketDataForMultiCall = ammMarkets.map((market) => ({
        address: market.address as Address,
        decimals: market.collateralToken.decimals,
      }))

      const pricesResult = ammMarkets.length > 0 ? await getPrices(marketDataForMultiCall) : []

      const _markets = new Map<`0x${string}`, OddsData>(
        pricesResult.map((item) => [item.address, { prices: item.prices }])
      )

      const result = response.data.map((market) => {
        return {
          ...market,
          prices:
            market.tradeType === 'amm'
              ? _markets.get(market.address as `0x${string}`)?.prices || [50, 50]
              : [
                  calculateMarketPrice(market?.prices?.[0]),
                  calculateMarketPrice(market?.prices?.[1]),
                ],
        }
      })

      return {
        data: {
          markets: result,
          totalAmount: response.totalMarketsCount,
        },
        next: (pageParam as number) + 1,
      }
    },
    initialPageParam: 1, //default page number
    getNextPageParam: (lastPage) => {
      if ('x-ignore-limits' in customHeaders) {
        return null
      }
      return lastPage.data.totalAmount < LIMIT_PER_PAGE ? null : lastPage.next
    },
    refetchOnWindowFocus: false,
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useBanneredMarkets(topic: Category | null) {
  return useQuery({
    queryKey: ['bannered-markets', topic],
    queryFn: async () => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/bannered`
      const marketBaseUrl = topic?.id ? `${baseUrl}/${topic?.id}` : baseUrl

      const { data: response }: AxiosResponse<Market[]> = await axios.get(marketBaseUrl)

      const slicedMarkets = response.length <= 12 ? response : response.slice(0, 12)

      const ammMarkets = slicedMarkets.filter((market) => market.tradeType === 'amm')

      const marketDataForMultiCall = ammMarkets.map((market) => ({
        address: market.address as Address,
        decimals: market.collateralToken.decimals,
      }))

      const pricesResult = ammMarkets.length > 0 ? await getPrices(marketDataForMultiCall) : []

      const _markets = new Map<`0x${string}`, OddsData>(
        pricesResult.map((item) => [item.address, { prices: item.prices }])
      )

      const result = slicedMarkets.map((market) => {
        return {
          ...market,
          prices:
            market.tradeType === 'amm'
              ? _markets.get(market.address as Address)?.prices || [50, 50]
              : [
                  new BigNumber(market?.prices?.[0])
                    .multipliedBy(100)
                    .decimalPlaces(0)
                    .toNumber() ?? 50,
                  new BigNumber(market?.prices?.[1])
                    .multipliedBy(100)
                    .decimalPlaces(0)
                    .toNumber() ?? 50,
                ],
        }
      })

      return result
    },
    refetchOnWindowFocus: false,
  })
}

export function useAllMarkets() {
  const { data: markets } = useQuery({
    queryKey: ['allMarkets'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets`)
      return response.data as Market[]
    },
  })

  return useMemo(() => markets ?? [], [markets])
}

export function usePrices(data: { address: `0x${string}`; decimals: number }[]) {
  return useQuery({
    queryKey: ['get-prices', data],
    queryFn: async () => {
      const response = await getPrices(data)
      return response
    },
    refetchOnWindowFocus: true,
  })
}

export function useMarketByConditionId(conditionId: string, enabled = true) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['marketByConditionId', conditionId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/conditions/${conditionId}`
      )

      const marketRes = response.data as Market

      let prices = [50, 50]

      //TODO remove this hot-fix
      if (marketRes.expired) {
        if (marketRes?.winningOutcomeIndex === 0) {
          prices = [100, 0]
        } else if (marketRes?.winningOutcomeIndex === 1) {
          prices = [0, 100]
        } else {
          prices = [50, 50]
        }
      } else {
        const buyPrices = await getMarketOutcomeBuyPrice(
          marketRes.collateralToken.decimals,
          marketRes.address as Address
        )

        const sum = buyPrices[0] + buyPrices[1]
        const outcomeTokensPercentYes = +((buyPrices[0] / sum) * 100).toFixed(1)
        const outcomeTokensPercentNo = +((buyPrices[1] / sum) * 100).toFixed(1)
        prices = [outcomeTokensPercentYes, outcomeTokensPercentNo]
      }

      return {
        ...marketRes,
        prices,
      } as Market
    },
    enabled: enabled,
  })

  const market = useMemo(() => data ?? null, [data])

  const refetchMarket = () => refetch()
  return { market, isLoading, refetchMarket }
}

export function useMarket(address?: string | null, isPolling = false, enabled = true) {
  return useQuery({
    queryKey: ['market', address],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${address}`
      )
      const marketRes = response.data as Market

      let prices

      //TODO remove this hot-fix
      if (marketRes.expired) {
        if (marketRes?.winningOutcomeIndex === 0) {
          prices = [100, 0]
        } else if (marketRes?.winningOutcomeIndex === 1) {
          prices = [0, 100]
        } else {
          prices = [50, 50]
        }
      } else {
        if (marketRes.tradeType === 'clob') {
          prices = [
            new BigNumber(marketRes.prices?.[0] || 0.5)
              .multipliedBy(100)
              .decimalPlaces(0)
              .toNumber(),
            new BigNumber(marketRes.prices?.[1] || 0.5)
              .multipliedBy(100)
              .decimalPlaces(0)
              .toNumber(),
          ]
        } else {
          const buyPrices = await getMarketOutcomeBuyPrice(
            marketRes.collateralToken.decimals,
            marketRes.address as Address
          )

          const sum = buyPrices[0] + buyPrices[1]
          const outcomeTokensPercentYes = +((buyPrices[0] / sum) * 100).toFixed(1)
          const outcomeTokensPercentNo = +((buyPrices[1] / sum) * 100).toFixed(1)
          prices = [outcomeTokensPercentYes, outcomeTokensPercentNo]
        }
      }

      return {
        ...marketRes,
        prices,
      } as Market
    },
    enabled: !!address && address !== '0x' && enabled,
    refetchInterval: isPolling ? POLLING_INTERVAL : false,
  })
}

const getMarketOutcomeBuyPrice = async (decimals: number, marketAddress: Address) => {
  const fixedProductMarketMakerContract = getContract({
    address: marketAddress,
    abi: fixedProductMarketMakerABI,
    client: publicClient,
  })
  const collateralDecimals = decimals
  const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`
  const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)
  const outcomeTokenAmountYesBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
    collateralAmountBI,
    0,
  ])) as bigint
  const outcomeTokenAmountNoBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
    collateralAmountBI,
    1,
  ])) as bigint
  const outcomeTokenAmountYes = formatUnits(outcomeTokenAmountYesBI, collateralDecimals)
  const outcomeTokenAmountNo = formatUnits(outcomeTokenAmountNoBI, collateralDecimals)
  const outcomeTokenPriceYes = Number(collateralAmount) / Number(outcomeTokenAmountYes)
  const outcomeTokenPriceNo = Number(collateralAmount) / Number(outcomeTokenAmountNo)

  return [outcomeTokenPriceYes, outcomeTokenPriceNo]
}

export const useWinningIndex = (marketAddr: string) =>
  useQuery({
    queryKey: ['winning-index', marketAddr],
    queryFn: async () => {
      const query = `
      query getMarketWinningIndex {
        AutomatedMarketMaker(
          where: { 
            id: { 
              _ilike: "${marketAddr}" 
            } 
          }
        ) {
          condition {
            payoutNumerators
          }
        }
      }
      `

      const response = await axios.post(newSubgraphURI[defaultChain.id], { query })

      const data: {
        condition?: {
          payoutNumerators?: number[] | null
        }
      }[] = response.data.data?.AutomatedMarketMaker
      const [market] = data

      const payoutNumerators = market?.condition?.payoutNumerators
      if (!payoutNumerators) return null

      const result = payoutNumerators.findIndex((num) => num === 1)

      return result
    },
  })

export const useMarketRewards = (slug?: string, isRewardable?: boolean) => {
  const { web3Wallet } = useAccount()
  const privateClient = useAxiosPrivateClient()
  return useQuery({
    queryKey: ['reward-distribution', slug, web3Wallet?.account?.address],
    queryFn: async () => {
      const response: AxiosResponse<MarketRewardsResponse[]> = await privateClient.get(
        `/reward-distribution/unpaid-rewards?market=${slug}`
      )
      return response.data
    },
    enabled: !!slug && !!web3Wallet && !!isRewardable,
    refetchInterval: 60000,
  })
}
