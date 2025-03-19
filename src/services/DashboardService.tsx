import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { DashboardTagId } from '@/components/common/markets/dashboard-section'
import { calculateMarketPrice } from './MarketsService'
import { defaultChain } from '@/constants'
import { fixedProductMarketMakerABI } from '@/contracts'
import { Market } from '@/types'

interface ApiResponse {
  data: Market[]
  totalMarketsCount: number
}

interface DashboardPage {
  data: {
    markets: Market[]
    totalAmount: number
  }
  next: number
}

type Address = string

interface OddsData {
  prices: number[]
}

const DASHBOARD_LIMIT = 65

export const useInfinityDashboard = (tagId?: DashboardTagId) => {
  return useInfiniteQuery<DashboardPage, Error>({
    queryKey: ['dashboard-infinity', tagId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/dashboard`,
        {
          params: {
            page: pageParam,
            limit: DASHBOARD_LIMIT,
            ...(tagId && { tagId }),
          },
        }
      )

      const ammMarkets = response.data.data.filter((market) => market.tradeType === 'amm')

      const marketDataForMultiCall = ammMarkets.map((market) => ({
        address: market.address as Address,
        decimals: market.collateralToken.decimals,
      }))

      if (ammMarkets.length > 0) {
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
            const outcomeTokenBuyAmountNo = formatUnits(
              outcomeTokenBuyAmountNoBI,
              collateralDecimals
            )

            const outcomeTokenBuyPriceYes =
              Number(collateralAmount) / Number(outcomeTokenBuyAmountYes)
            const outcomeTokenBuyPriceNo =
              Number(collateralAmount) / Number(outcomeTokenBuyAmountNo)

            const buySum = outcomeTokenBuyPriceYes + outcomeTokenBuyPriceNo
            const outcomeTokensBuyPercentYes = +((outcomeTokenBuyPriceYes / buySum) * 100).toFixed(
              1
            )
            const outcomeTokensBuyPercentNo = +((outcomeTokenBuyPriceNo / buySum) * 100).toFixed(1)

            acc.set(marketAddress as Address, {
              prices: [outcomeTokensBuyPercentYes, outcomeTokensBuyPercentNo],
            })

            return acc
          }

          return acc
        }, new Map<Address, OddsData>())

        const result = response.data.data.map((market) => {
          return {
            ...market,
            prices:
              market.tradeType === 'amm'
                ? _markets.get(market.address as Address)?.prices || [50, 50]
                : [
                    calculateMarketPrice(market?.prices?.[0]),
                    calculateMarketPrice(market?.prices?.[1]),
                  ],
          }
        })

        return {
          data: {
            markets: result,
            totalAmount: response.data.totalMarketsCount,
          },
          next: (pageParam as number) + 1,
        }
      } else {
        const result = response.data.data.map((market) => {
          return {
            ...market,
            prices: [
              calculateMarketPrice(market?.prices?.[0]),
              calculateMarketPrice(market?.prices?.[1]),
            ],
          }
        })

        return {
          data: {
            markets: result,
            totalAmount: response.data.totalMarketsCount,
          },
          next: (pageParam as number) + 1,
        }
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.markets?.length === DASHBOARD_LIMIT ? lastPage.next : undefined
    },
    refetchOnWindowFocus: false,
    enabled: !!tagId,
  })
}
