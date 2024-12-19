import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { limitlessApi } from '@/services'

export interface OrderBook {
  bids: {
    price: number
    size: number
  }[]
  asks: {
    price: number
    size: number
  }[]
}

export function useOrderBook(slug?: string) {
  return useQuery({
    queryKey: ['order-book', slug],
    queryFn: async () => {
      const response: AxiosResponse<OrderBook> = await limitlessApi.get(
        `/markets/${slug}/orderbook`
      )
      return response.data
    },
    enabled: !!slug,
  })
}
