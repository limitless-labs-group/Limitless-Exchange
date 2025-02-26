import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import { formatUnits, parseUnits } from 'viem'
import { limitlessApi } from '@/services'

export interface OrderBook {
  bids: Order[]
  asks: Order[]
  lastTradePrice: string
  tokenId: string
  adjustedMidpoint: number
  maxSpread: string
  minSize: string
}

export interface Order {
  price: number
  size: number
}

export function useOrderBook(slug?: string) {
  return useQuery({
    queryKey: ['order-book', slug],
    queryFn: async () => {
      const response: AxiosResponse<OrderBook> = await limitlessApi.get(
        `/markets/${slug}/orderbook`
      )
      return {
        ...response.data,
        maxSpread: new BigNumber(response.data.maxSpread).minus('0.005').toString(),
      }
      // return {
      //   ...response.data,
      //   asks: response.data.asks.filter((ask) => {
      //     return new BigNumber(formatUnits(BigInt(ask.size.toFixed(0)), 6))
      //       .multipliedBy(new BigNumber(ask.price))
      //       .isGreaterThanOrEqualTo(0.01)
      //   }),
      //   bids: response.data.bids.filter((bid) =>
      //     new BigNumber(formatUnits(BigInt(bid.size.toFixed(0)), 6))
      //       .multipliedBy(new BigNumber(bid.price))
      //       .isGreaterThanOrEqualTo(0.01)
      //   ),
      // }
    },
    enabled: !!slug,
    refetchInterval: 5000,
  })
}
