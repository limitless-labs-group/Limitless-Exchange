import { useInfiniteQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import useClient from '@/hooks/use-client'
import { FeedEntity, FeedResponse } from '@/types'

export function useFeed() {
  const { client, isLogged } = useClient()
  return useInfiniteQuery<FeedEntity<unknown>[], Error>({
    queryKey: ['feed', isLogged],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/feed`
      const response: AxiosResponse<FeedResponse> = await client.get('/feed', {
        params: {
          page: pageParam,
          limit: 15,
        },
      })
      // const marketsWithStatusUpdate = response.data.data.filter((market) =>
      //   [
      //     FeedEventType.Funded,
      //     FeedEventType.Locked,
      //     FeedEventType.LockedGroup,
      //     FeedEventType.FundedGroup,
      //   ].includes(market.eventType)
      // )
      // console.log(marketsWithStatusUpdate)
      // if (marketsWithStatusUpdate.length) {
      //   const marketDataForMultiCall = marketsWithStatusUpdate.flatMap((market) => {
      //     // @ts-ignore
      //     if (!market.data.slug) {
      //       const item = market.data as MarketStatusFeedData
      //       return {
      //         address: item.address,
      //         decimals: item.collateralToken.decimals,
      //       }
      //     }
      //     const group = market.data as MarketGroupStatusFeedData
      //     // @ts-ignore
      //     return group.markets.map((marketInGroup) => {
      //       return {
      //         address: marketInGroup.address,
      //         decimals: group.collateralToken.decimals,
      //       }
      //     })
      //   })
      //   const contractCallContext = marketDataForMultiCall.map(
      //     (market: { address: string; decimals: number }) => {
      //       const collateralDecimals = market.decimals
      //       const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'
      //       const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)
      //
      //       return {
      //         reference: market.address,
      //         contractAddress: market.address,
      //         abi: fixedProductMarketMakerABI,
      //         calls: [
      //           {
      //             reference: 'calcBuyAmountYes',
      //             methodName: 'calcBuyAmount',
      //             methodParameters: [collateralAmountBI.toString(), 0],
      //           },
      //           {
      //             reference: 'calcBuyAmountNo',
      //             methodName: 'calcBuyAmount',
      //             methodParameters: [collateralAmountBI.toString(), 1],
      //           },
      //         ],
      //       }
      //     }
      //   )
      //
      //   const multicall = new Multicall({
      //     ethersProvider: new ethers.providers.JsonRpcProvider(
      //       defaultChain.rpcUrls.default.http.toString()
      //     ),
      //     multicallCustomContractAddress: defaultChain.contracts.multicall3.address,
      //     tryAggregate: true,
      //   })
      //
      //   const { results } = await multicall.call(contractCallContext)
      //   const result = marketsWithStatusUpdate.map((market) => {
      //     debugger
      //     // @ts-ignore
      //     if (!market.data.slug) {
      //       const item = market.data as MarketStatusFeedData
      //       const marketAddress = item.address
      //       const result = results[marketAddress].callsReturnContext
      //       const collateralDecimals = item.collateralToken.decimals
      //       const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'
      //
      //       const outcomeTokenBuyAmountYesBI = BigInt(result[0].returnValues[0].hex)
      //       const outcomeTokenBuyAmountNoBI = BigInt(result[1].returnValues[0].hex)
      //
      //       const outcomeTokenBuyAmountYes = formatUnits(
      //         outcomeTokenBuyAmountYesBI,
      //         collateralDecimals
      //       )
      //       const outcomeTokenBuyAmountNo = formatUnits(
      //         outcomeTokenBuyAmountNoBI,
      //         collateralDecimals
      //       )
      //
      //       const outcomeTokenBuyPriceYes =
      //         Number(collateralAmount) / Number(outcomeTokenBuyAmountYes)
      //       const outcomeTokenBuyPriceNo =
      //         Number(collateralAmount) / Number(outcomeTokenBuyAmountNo)
      //
      //       const buySum = outcomeTokenBuyPriceYes + outcomeTokenBuyPriceNo
      //       const outcomeTokensBuyPercentYes = +((outcomeTokenBuyPriceYes / buySum) * 100).toFixed(
      //         1
      //       )
      //       const outcomeTokensBuyPercentNo = +((outcomeTokenBuyPriceNo / buySum) * 100).toFixed(1)
      //
      //       return {
      //         ...market,
      //         data: {
      //           // @ts-ignore
      //           ...market.data,
      //           prices: [outcomeTokensBuyPercentYes, outcomeTokensBuyPercentNo],
      //         },
      //       }
      //     }
      //   })
      //   console.log(result)
      // }
      return { data: response.data, next: (pageParam as number) + 1 }
    },
    initialPageParam: 1, //default page number
    getNextPageParam: (lastPage) => {
      // @ts-ignore
      return lastPage?.data.totalPages < lastPage.next ? null : lastPage.next
    },
    refetchOnWindowFocus: false,
    // keepPreviousData: true,
  })
}
