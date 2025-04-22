import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import { formatUnits } from 'viem'
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

export function useOrderBook(slug?: string, tradeType?: 'amm' | 'clob') {
  return useQuery({
    queryKey: ['order-book', slug],
    queryFn: async () => {
      // const response: AxiosResponse<OrderBook> = await limitlessApi.get(
      //   `/markets/${slug}/orderbook`
      // )
      const response = {
        data: {
          bids: [
            {
              price: 0.95,
              size: 701000000,
              side: 'BUY',
            },
            {
              price: 0.64,
              size: 800000000,
              side: 'BUY',
            },
          ],
          asks: [
            {
              price: 0.999,
              size: 200000000,
              side: 'SELL',
            },
          ],
          tokenId: '29938812796996214758481416833721685895876020125273868499444364630866947959224',
          lastTradePrice: 0.7,
          adjustedMidpoint: 0.9744999999999999,
          maxSpread: '0.035',
          minSize: '100000000',
        },
      }
      return {
        ...response.data,
        maxSpread: new BigNumber(response.data.maxSpread).minus('0.005').toString(),
        asks: response.data.asks.filter((ask) => {
          return new BigNumber(formatUnits(BigInt(ask.size.toFixed(0)), 6))
            .multipliedBy(new BigNumber(ask.price))
            .isGreaterThanOrEqualTo(0.01)
        }),
        bids: response.data.bids.filter((bid) =>
          new BigNumber(formatUnits(BigInt(bid.size.toFixed(0)), 6))
            .multipliedBy(new BigNumber(bid.price))
            .isGreaterThanOrEqualTo(0.01)
        ),
      }
    },
    enabled: !!slug && tradeType === 'clob',
    refetchInterval: 5000,
  })
}
