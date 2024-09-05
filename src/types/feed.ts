import { Address } from 'viem'

export enum FeedEventType {
  Funded = 'FUNDED_MARKET',
  Resolved = 'RESOLVED_MARKET',
  Locked = 'LOCKED_MARKET',
  NewPost = 'NEW_POST',
  ResolvedGroup = 'RESOLVED_GROUP',
  FundedGroup = 'FUNDED_GROUP',
  LockedGroup = 'LOCKED_GROUP',
}

export interface FeedEventUser {
  name: string
  imageURI: string
  link: string
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
