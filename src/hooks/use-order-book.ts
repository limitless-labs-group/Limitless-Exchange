import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
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
      return {
        bids: [
          {
            price: 0.12,
            size: 1127723183,
            side: 'BUY',
          },
          {
            price: 0.105,
            size: 2500000000,
            side: 'BUY',
          },
          {
            price: 0.08,
            size: 202000000,
            side: 'BUY',
          },
          {
            price: 0.01,
            size: 2000000000,
            side: 'BUY',
          },
        ],
        asks: [
          {
            price: 0.15,
            size: 100000000,
            side: 'SELL',
          },
          {
            price: 0.38,
            size: 100000000,
            side: 'SELL',
          },
          {
            price: 0.99,
            size: 1000000000,
            side: 'SELL',
          },
        ],
        tokenId: '67354934772933660976333072373492305909519455738242108659979302147764959766222',
        lastTradePrice: 0.11,
        adjustedMidpoint: 0.135,
        maxSpread: '0.03',
        minSize: '100000000',
      }
      // const response: AxiosResponse<OrderBook> = await limitlessApi.get(
      //   `/markets/${slug}/orderbook`
      // )
      // return {
      //   ...response.data,
      //   maxSpread: new BigNumber(response.data.maxSpread).minus('0.005').toString(),
      // }
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
