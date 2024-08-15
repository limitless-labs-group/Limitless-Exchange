import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import {
  Category,
  Market,
  MarketData,
  MarketGroupCardResponse,
  MarketSingleCardResponse,
  OddsData,
  SingleMarket,
} from '@/types'
import { useMemo } from 'react'
import { defaultChain, newSubgraphURI } from '@/constants'
import { Address, formatUnits, getContract, parseUnits } from 'viem'
import { fixedProductMarketMakerABI } from '@/contracts'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { publicClient } from '@/providers'

const LIMIT_PER_PAGE = 30

/**
 * Fetches and manages paginated active market data using the `useInfiniteQuery` hook.
 * Active market is FUNDED market and not hidden only
 *
 * @returns {(MarketGroupCardResponse | MarketSingleCardResponse)[]} which represents pages of markets
 */
export function useMarkets(topic: Category | null) {
  return useInfiniteQuery<MarketData, Error>({
    queryKey: ['markets', topic],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`
      const marketBaseUrl = topic?.id ? `${baseUrl}/${topic?.id}` : baseUrl

      const response: AxiosResponse<(MarketGroupCardResponse | MarketSingleCardResponse)[]> =
        await axios.get(marketBaseUrl, {
          params: {
            page: pageParam,
            limit: LIMIT_PER_PAGE,
          },
        })

      const marketDataForMultiCall = response.data.flatMap((market) => {
        // @ts-ignore
        if (!market.slug) {
          return {
            // @ts-ignore
            address: market.address,
            decimals: market.collateralToken.decimals,
          }
        }
        // @ts-ignore
        return market.markets.map((marketInGroup) => {
          return {
            address: marketInGroup.address,
            decimals: market.collateralToken.decimals,
          }
        })
      }) as { address: string; decimals: number }[]

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

      const _markets: Map<Address, OddsData> = marketDataForMultiCall.reduce(
        (acc, market: { address: string; decimals: number }) => {
          const marketAddress = market.address
          const result = results.results[marketAddress].callsReturnContext
          const collateralDecimals = market.decimals
          const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'

          const outcomeTokenBuyAmountYesBI = BigInt(result[0].returnValues[0].hex)
          const outcomeTokenBuyAmountNoBI = BigInt(result[1].returnValues[0].hex)

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
        },
        new Map<Address, OddsData>()
      )

      const result = response.data.map((market) => {
        // @ts-ignore
        if (!market.slug) {
          return {
            ...market,
            // @ts-ignore
            ...(_markets.get(market.address) as OddsData),
          }
        }
        return {
          ...market,
          // @ts-ignore
          markets: market.markets
            .map((marketInGroup: MarketSingleCardResponse) => ({
              ...marketInGroup,
              // @ts-ignore
              ...(_markets.get(marketInGroup.address) as OddsData),
            }))
            .sort(
              (a: MarketSingleCardResponse, b: MarketSingleCardResponse) =>
                b.prices[0] - a.prices[0]
            ),
        }
      })

      return { data: result, next: (pageParam as number) + 1 }
    },
    initialPageParam: 1, //default page number
    getNextPageParam: (lastPage) => {
      return lastPage.data.length < LIMIT_PER_PAGE ? null : lastPage.next
    },
    refetchOnWindowFocus: false,
  })
}

// const { data: marketOnChainPercentageData } = useQuery({
//   queryKey: ['marketOnChainPercentageData'],
//   queryFn: async () => {
//     const markets =
//   },
// })

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

export function useMarketByConditionId(conditionId: string) {
  const { data: market } = useQuery({
    queryKey: ['marketByConditionId', conditionId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/conditions/${conditionId}`
      )
      return response.data as Market
    },
  })

  return useMemo(() => market ?? null, [market])
}

const mockMarket = {
  address: {
    '8453': '0xD7e3DB707Af8fbA58a56b603DaD9CdB982ed2916',
  },
  questionId: {
    '8453': '0x20f8f2ab40a697f4644d18b61b4cd18672faf8dc864dde7934f746ed4eb0fd78',
  },
  conditionId: {
    '8453': '0x5641c258cfc9fa217966768829263f7268c254f875909f19fffe97f97b93ca7a',
  },
  collateralToken: {
    '8453': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  hidden: {
    '8453': false,
  },
  resolved: {
    '8453': false,
  },
  tokenTicker: {
    '8453': 'USDC',
  },
  tokenURI: {
    '8453': 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
  },
  outcomeTokens: ['Yes', 'No'],
  title: 'Will Portugal win the EURO 2024?',
  description:
    'The market will resolve to "YES" if the Portuguese national team wins EURO 2024. If Portugal is eliminated at any stage before winning the final, the market will resolve to "NO".',
  placeholderURI:
    'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/20/image.jpg',
  imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/20/image.jpg',
  ogImageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/20/og.jpg',
  expirationDate: 'Jul 14, 2024',
  expirationTimestamp: 1720915200000,
  winningOutcomeIndex: null,
  expired: false,
  creator: {
    name: 'Dima Horshkov',
    imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/7/pfp.png',
    link: 'https://x.com/dimahorshkov',
  },
  tags: ['Football', 'EURO', 'EURO2024'],
  volume: '19200000',
  volumeFormatted: '19.2',
  liquidity: '250000000',
  liquidityFormatted: '250',
  createdAt: '2024-06-19T11:59:27.097Z',
  prices: [0, 0],
}

export function useMarket(address?: string) {
  return useQuery({
    queryKey: ['market', address],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${address}`
      )
      const marketRes = response.data as SingleMarket

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
          marketRes.address
        )

        const sum = buyPrices[0] + buyPrices[1]
        const outcomeTokensPercentYes = +((buyPrices[0] / sum) * 100).toFixed(1)
        const outcomeTokensPercentNo = +((buyPrices[1] / sum) * 100).toFixed(1)
        prices = [outcomeTokensPercentYes, outcomeTokensPercentNo]
      }

      return {
        ...marketRes,
        prices,
      }
    },
    enabled: !!address && address !== '0x',
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

const getMarketOutcomeSellPrice = async (decimals: number, marketAddress: Address) => {
  const fixedProductMarketMakerContract = getContract({
    address: marketAddress,
    abi: fixedProductMarketMakerABI,
    client: publicClient,
  })
  const collateralDecimals = decimals
  const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`
  const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)
  const outcomeTokenAmountYesBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
    collateralAmountBI,
    0,
  ])) as bigint
  const outcomeTokenAmountNoBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
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
