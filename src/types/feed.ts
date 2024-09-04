import { Address } from 'viem'

export enum FeedEventType {
  Funded = 'FUNDED_MARKET',
  Resolved = 'RESOLVED_MARKET',
  NewPost = 'NEW_POST',
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
