export enum ClobPositionType {
  ALL = 'all',
  PAST = 'past',
  ACTIVE = 'active',
}

export interface OrderBookData {
  orderBookData: OrderBookDataOrders
  spread: string
  lastPrice: string
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
