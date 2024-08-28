import { Address } from 'viem'

export interface FeedEvent<T> {
  creator: {
    name: string
    imageURI: string
    link: string
  }
  timestamp: number
  eventType: FeedEventType
  market: {
    name: string
    address: Address
  }
  data: T
}

export enum FeedEventType {
  BoughtContracts = 'boughtContracts',
  SoldContracts = 'soldContracts',
  MarketCreated = 'marketCreated',
  MarketClosed = 'marketClosed',
}

export interface TradeContractsData {
  price: number
  outcomeIndex: number
  collateralToken: {
    symbol: string
    collateralAmount: number
    address: Address
  }
}

export interface MarketStatusData {
  liquidity: number
  volume: number
  prices: number[]
  collateralToken: {
    symbol: string
    collateralAmount: number
    address: Address
  }
}
