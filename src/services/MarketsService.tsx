import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { Address, formatUnits, getContract, parseUnits } from 'viem'
import { mockGroup } from '@/app/mock'
import { defaultChain, newSubgraphURI } from '@/constants'
import { POLLING_INTERVAL } from '@/constants/application'
import { fixedProductMarketMakerABI } from '@/contracts'
import { publicClient } from '@/providers/Privy'
import { useAccount } from '@/services/AccountService'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { Category, Market, MarketRewardsResponse, MarketsResponse, OddsData } from '@/types'
import { getPrices } from '@/utils/market'

const LIMIT_PER_PAGE = 50

export function useMarkets(topic: Category | null) {
  return useInfiniteQuery({
    queryKey: ['markets', topic],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`
      const marketBaseUrl = topic?.id ? `${baseUrl}/${topic?.id}` : baseUrl
      const { data: response }: AxiosResponse<MarketsResponse> = await axios.get(marketBaseUrl, {
        params: {
          page: pageParam,
          limit: LIMIT_PER_PAGE,
        },
      })

      // const marketDataForMultiCall = response.data.flatMap((market) => {
      //   // @ts-ignore
      //   if (!market.address) {
      //     return {
      //       // @ts-ignore
      //       address: market.address,
      //       decimals: market.collateralToken.decimals,
      //     }
      //   }
      //   // @ts-ignore
      //   return market.markets.map((marketInGroup) => {
      //     return {
      //       address: marketInGroup.address,
      //       decimals: market.collateralToken.decimals,
      //     }
      //   })
      // }) as { address: string; decimals: number }[]

      const ammMarkets = response.data.filter((market) => market.tradeType === 'amm')

      const marketDataForMultiCall = ammMarkets.map((market) => ({
        address: market.address as Address,
        decimals: market.collateralToken.decimals,
      }))

      const contractCallContext = marketDataForMultiCall.map(
        (market: { address: string; decimals: number }) => {
          const collateralDecimals = market.decimals
          const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'
          const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)

          return {
            reference: market.address,
            contractAddress: market.address,
            abi: fixedProductMarketMakerABI,
            calls: [
              {
                reference: 'calcBuyAmountYes',
                methodName: 'calcBuyAmount',
                methodParameters: [collateralAmountBI.toString(), 0],
              },
              {
                reference: 'calcBuyAmountNo',
                methodName: 'calcBuyAmount',
                methodParameters: [collateralAmountBI.toString(), 1],
              },
            ],
          }
        }
      )

      const multicall = new Multicall({
        ethersProvider: new ethers.providers.JsonRpcProvider(
          defaultChain.rpcUrls.default.http.toString()
        ),
        multicallCustomContractAddress: defaultChain.contracts.multicall3.address,
        tryAggregate: true,
      })

      const results = await multicall.call(contractCallContext)

      const _markets: Map<Address, OddsData> = ammMarkets.reduce((acc, market: Market) => {
        const marketAddress = market.address
        const result = results.results[marketAddress as Address].callsReturnContext
        const collateralDecimals = market.collateralToken.decimals
        const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'

        if (result[0].returnValues.length) {
          const outcomeTokenBuyAmountYesBI = BigInt(result[0].returnValues?.[0].hex)
          const outcomeTokenBuyAmountNoBI = BigInt(result[1].returnValues?.[0].hex)

          const outcomeTokenBuyAmountYes = formatUnits(
            outcomeTokenBuyAmountYesBI,
            collateralDecimals
          )
          const outcomeTokenBuyAmountNo = formatUnits(outcomeTokenBuyAmountNoBI, collateralDecimals)

          const outcomeTokenBuyPriceYes =
            Number(collateralAmount) / Number(outcomeTokenBuyAmountYes)
          const outcomeTokenBuyPriceNo = Number(collateralAmount) / Number(outcomeTokenBuyAmountNo)

          const buySum = outcomeTokenBuyPriceYes + outcomeTokenBuyPriceNo
          const outcomeTokensBuyPercentYes = +((outcomeTokenBuyPriceYes / buySum) * 100).toFixed(1)
          const outcomeTokensBuyPercentNo = +((outcomeTokenBuyPriceNo / buySum) * 100).toFixed(1)

          acc.set(marketAddress as Address, {
            prices: [outcomeTokensBuyPercentYes, outcomeTokensBuyPercentNo],
          })

          return acc
        }

        return acc
      }, new Map<Address, OddsData>())

      const result = response.data.map((market) => {
        return {
          ...market,
          prices:
            market.tradeType === 'amm'
              ? _markets.get(market.address?.toLowerCase() as Address)?.prices || [50, 50]
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

      return {
        data: {
          markets: result,
          totalAmount: response.totalMarketsCount,
        },
        next: (pageParam as number) + 1,
      }

      // return {
      //   data: {
      //     markets: response.data.map((market) => ({
      //       ...market,
      //       prices: [
      //         new BigNumber(market.prices[0]).multipliedBy(100).decimalPlaces(0).toNumber(),
      //         new BigNumber(market.prices[1]).multipliedBy(100).decimalPlaces(0).toNumber(),
      //       ],
      //     })),
      //     totalAmount: response.totalMarketsCount,
      //   },
      //   next: (pageParam as number) + 1,
      // }
    },
    initialPageParam: 1, //default page number
    getNextPageParam: (lastPage) => {
      // @ts-ignore
      return lastPage.data.length < LIMIT_PER_PAGE ? null : lastPage.next
    },
    refetchOnWindowFocus: false,
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

      const ammMarkets = response.filter((market) => market.tradeType === 'amm')

      const marketDataForMultiCall = ammMarkets.map((market) => ({
        address: market.address as Address,
        decimals: market.collateralToken.decimals,
      }))

      const contractCallContext = marketDataForMultiCall.map(
        (market: { address: string; decimals: number }) => {
          const collateralDecimals = market.decimals
          const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'
          const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)

          return {
            reference: market.address,
            contractAddress: market.address,
            abi: fixedProductMarketMakerABI,
            calls: [
              {
                reference: 'calcBuyAmountYes',
                methodName: 'calcBuyAmount',
                methodParameters: [collateralAmountBI.toString(), 0],
              },
              {
                reference: 'calcBuyAmountNo',
                methodName: 'calcBuyAmount',
                methodParameters: [collateralAmountBI.toString(), 1],
              },
            ],
          }
        }
      )

      const multicall = new Multicall({
        ethersProvider: new ethers.providers.JsonRpcProvider(
          defaultChain.rpcUrls.default.http.toString()
        ),
        multicallCustomContractAddress: defaultChain.contracts.multicall3.address,
        tryAggregate: true,
      })

      const results = await multicall.call(contractCallContext)

      const _markets: Map<Address, OddsData> = ammMarkets.reduce((acc, market: Market) => {
        const marketAddress = market.address
        const result = results.results[marketAddress as Address].callsReturnContext
        const collateralDecimals = market.collateralToken.decimals
        const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'

        if (result[0].returnValues.length) {
          const outcomeTokenBuyAmountYesBI = BigInt(result[0].returnValues?.[0].hex)
          const outcomeTokenBuyAmountNoBI = BigInt(result[1].returnValues?.[0].hex)

          const outcomeTokenBuyAmountYes = formatUnits(
            outcomeTokenBuyAmountYesBI,
            collateralDecimals
          )
          const outcomeTokenBuyAmountNo = formatUnits(outcomeTokenBuyAmountNoBI, collateralDecimals)

          const outcomeTokenBuyPriceYes =
            Number(collateralAmount) / Number(outcomeTokenBuyAmountYes)
          const outcomeTokenBuyPriceNo = Number(collateralAmount) / Number(outcomeTokenBuyAmountNo)

          const buySum = outcomeTokenBuyPriceYes + outcomeTokenBuyPriceNo
          const outcomeTokensBuyPercentYes = +((outcomeTokenBuyPriceYes / buySum) * 100).toFixed(1)
          const outcomeTokensBuyPercentNo = +((outcomeTokenBuyPriceNo / buySum) * 100).toFixed(1)

          acc.set(marketAddress as Address, {
            prices: [outcomeTokensBuyPercentYes, outcomeTokensBuyPercentNo],
          })

          return acc
        }

        return acc
      }, new Map<Address, OddsData>())

      const result = response.map((market) => {
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
