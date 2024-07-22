import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { Category, Market, MarketData, MarketResponse, OddsData } from '@/types'
import { useMemo } from 'react'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { defaultChain } from '@/constants'
import { Address, formatUnits, parseUnits } from 'viem'
import { fixedProductMarketMakerABI } from '@/contracts'

const LIMIT_PER_PAGE = 20

/**
 * Fetches and manages paginated active market data using the `useInfiniteQuery` hook.
 * Active market is FUNDED market and not hidden only
 *
 * @returns {MarketData[]} which represents pages of markets
 */
export function useMarkets(topic: Category | null) {
  return useInfiniteQuery<MarketData, Error>({
    queryKey: ['markets'],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`
      const marketBaseUrl = topic?.id ? `${baseUrl}/${topic?.id}` : baseUrl

      const response: AxiosResponse<MarketResponse[]> = await axios.get(marketBaseUrl, {
        params: {
          page: pageParam,
          limit: LIMIT_PER_PAGE,
        },
      })
      const markets = response.data

      const contractCallContext = markets.map((market: MarketResponse) => {
        const collateralDecimals = market.tokenTicker[defaultChain.id] === 'USDC' ? 6 : 18
        const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'
        const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)

        return {
          reference: market.address[defaultChain.id],
          contractAddress: market.address[defaultChain.id],
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
            // {
            //   reference: 'calcSellAmountYes',
            //   methodName: 'calcSellAmount',
            //   methodParameters: [collateralAmountBI.toString(), 0],
            // },
            // {
            //   reference: 'calcSellAmountNo',
            //   methodName: 'calcSellAmount',
            //   methodParameters: [collateralAmountBI.toString(), 1],
            // },
          ],
        }
      })

      const multicall = new Multicall({
        ethersProvider: new ethers.providers.JsonRpcProvider(
          defaultChain.rpcUrls.default.http.toString()
        ),
        tryAggregate: true,
      })

      const results = await multicall.call(contractCallContext)

      const _markets: Map<Address, OddsData> = markets.reduce((acc, market: MarketResponse) => {
        const marketAddress = market.address[defaultChain.id]
        const result = results.results[marketAddress].callsReturnContext
        const collateralDecimals = market.tokenTicker[defaultChain.id] === 'USDC' ? 6 : 18
        const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'

        const outcomeTokenBuyAmountYesBI = BigInt(result[0].returnValues[0].hex)
        const outcomeTokenBuyAmountNoBI = BigInt(result[1].returnValues[0].hex)
        // const outcomeTokenSellAmountYesBI = BigInt(result[2].returnValues[0].hex)
        // const outcomeTokenSellAmountNoBI = BigInt(result[3].returnValues[0].hex)

        const outcomeTokenBuyAmountYes = formatUnits(outcomeTokenBuyAmountYesBI, collateralDecimals)
        const outcomeTokenBuyAmountNo = formatUnits(outcomeTokenBuyAmountNoBI, collateralDecimals)
        // const outcomeTokenSellAmountYes = formatUnits(
        //   outcomeTokenSellAmountYesBI,
        //   collateralDecimals
        // )
        // const outcomeTokenSellAmountNo = formatUnits(outcomeTokenSellAmountNoBI, collateralDecimals)

        const outcomeTokenBuyPriceYes = Number(collateralAmount) / Number(outcomeTokenBuyAmountYes)
        const outcomeTokenBuyPriceNo = Number(collateralAmount) / Number(outcomeTokenBuyAmountNo)
        // const outcomeTokenSellPriceYes =
        //   Number(collateralAmount) / Number(outcomeTokenSellAmountYes)
        // const outcomeTokenSellPriceNo = Number(collateralAmount) / Number(outcomeTokenSellAmountNo)

        const buySum = outcomeTokenBuyPriceYes + outcomeTokenBuyPriceNo
        const outcomeTokensBuyPercentYes = +((outcomeTokenBuyPriceYes / buySum) * 100).toFixed(1)
        const outcomeTokensBuyPercentNo = +((outcomeTokenBuyPriceNo / buySum) * 100).toFixed(1)

        // const sellSum = outcomeTokenSellPriceYes + outcomeTokenSellPriceNo
        // const outcomeTokensSellPercentYes = +((outcomeTokenSellPriceYes / sellSum) * 100).toFixed(1)
        // const outcomeTokensSellPercentNo = +((outcomeTokenSellPriceNo / sellSum) * 100).toFixed(1)

        acc.set(marketAddress, {
          buyYesNo: [outcomeTokensBuyPercentYes, outcomeTokensBuyPercentNo],
          // sellYesNo: [outcomeTokensSellPercentYes, outcomeTokensSellPercentNo],
        })

        return acc
      }, new Map<Address, OddsData>())

      const result = markets.map((market) => ({
        ...market,
        ...(_markets.get(market.address[defaultChain.id]) as OddsData),
      }))

      return { data: result, next: (pageParam as number) + 1 }
    },
    initialPageParam: 1, //default page number
    getNextPageParam: (lastPage) => {
      return lastPage.next
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
      return response.data as Market
    },
    enabled: !!address && address !== '0x',
  })
}
