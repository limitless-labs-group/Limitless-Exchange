import { Address } from 'viem'

export enum FeedEventType {
  Funded = 'FUNDED_MARKET',
  Resolved = 'RESOLVED_MARKET',
  Locked = 'LOCKED_MARKET',
  NewPost = 'NEW_POST',
  ResolvedGroup = 'RESOLVED_GROUP',
  FundedGroup = 'FUNDED_GROUP',
  LockedGroup = 'LOCKED_GROUP',
  NewTrade = 'NEW_TRADE',
}

export interface FeedEventUser {
  name: string
  imageURI: string
  link: string
  account?: string
}

export interface MarketStatusFeedData {
  name: string
  address: Address
  collateralToken: {
    symbol: string
    address: Address
    decimals: number
  }
  volumeFormatted: string
  liquidityFormatted: string
  prices: number[]
}

export interface FeedNewPostData {
  content: string
  media: string
}

export interface FeedResponse {
  data: FeedEntity<unknown>[]
  totalPages: number
}

export interface FeedEntity<T> {
  eventType: FeedEventType
  timestamp: string
  user: FeedEventUser
  data: T
}

export interface MarketGroupFeedItem {
  title: string
  address: Address
  proxyTitle: string | null
  volumeFormatted: string
  liquidityFormatted: string
  prices: number[]
}

export interface MarketGroupStatusFeedData {
  name: string
  slug: string
  collateralToken: {
    symbol: string
    address: Address
    decimals: number
  }
  markets: MarketGroupFeedItem[]
}

export interface MarketNewTradeFeedData {
  title: string
  address: string
  strategy: 'Buy' | 'Sell'
  outcome: 'YES' | 'NO'
  contracts: string
  txHash: string
  collateralToken: {
    symbol: string
    address: Address
    decimals: number
  }
}
