export enum ClobPositionType {
  ALL = 'all',
  PAST = 'past',
  ACTIVE = 'active',
}

export interface OrderBookData {
  orderBookData: {
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
  spread: string
  lastPrice: string
}
