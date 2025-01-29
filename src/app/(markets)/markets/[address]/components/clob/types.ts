export enum ClobPositionType {
  ALL = 'all',
  PAST = 'past',
  ACTIVE = 'active',
}

export interface OrderBookData {
  orderBookData: {
    bids: { percent: string; cumulativePercent: string; price: number; size: number }[]
    asks: { percent: string; cumulativePercent: string; price: number; size: number }[]
  }
  orderbookSide: number
  setOrderbookSide: (val: number) => void
  spread: string
  calculateTotalContractsPrice: (size: number, price: number) => string
  lastPrice: string
}
