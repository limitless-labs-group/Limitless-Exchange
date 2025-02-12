import { UseMutationResult } from '@tanstack/react-query'

export enum ClobPositionType {
  ALL = 'all',
  PAST = 'past',
  ACTIVE = 'active',
}

export interface OrderBookData {
  orderBookData: OrderBookDataOrders
  spread: string
  lastPrice: string
  deleteBatchOrders: UseMutationResult<void, Error, { orders: string[] }, unknown>
}

export interface OrderBookDataOrders {
  bids: {
    percent: string
    cumulativePercent: string
    cumulativePrice: string
    price: number
    size: number
  }[]
  asks: {
    percent: string
    cumulativePercent: string
    cumulativePrice: string
    price: number
    size: number
  }[]
}
