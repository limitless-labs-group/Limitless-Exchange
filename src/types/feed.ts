import { Address } from 'viem'

export enum FeedEventType {
  Funded = 'FUNDED_MARKET',
  Resolved = 'RESOLVED_MARKET',
  Locked = 'LOCKED_MARKET',
  NewPost = 'NEW_POST',
  NewTrade = 'NEW_TRADE',
  Comment = 'COMMENT',
  CommentLike = 'COMMENT_LIKE',
  ResolvedGroup = 'RESOLVED_GROUP',
  FundedGroup = 'FUNDED_GROUP',
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
  slug: string
  volumeFormatted: string
  liquidityFormatted: string
  prices: number[]
}

export interface FeedNewPostData {
  content: string
  media: string
}

export interface FeedNewComment {
  title: string
  content: string
}

export interface FeedNewCommentLike {
  title: string
  content: string
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

export interface MarketNewTradeFeedData {
  slug: string
  contracts: string
  outcome: 'NO' | 'YES'
  strategy: 'Buy' | 'Sell'
  symbol: string
  title: string
  tradeAmount: string
  tradeAmountUSD: string
  txHash: string
}

export interface FeedMarketGroupEntity {
  title: string
  slug: string
  winningIndex: number
  volumeFormatted: string
  liquidityFormatted: string
}

export interface GroupFeedData {
  name: string
  slug: string
  collateralToken: {
    symbol: string
    address: Address
    decimals: number
  }
  markets: FeedMarketGroupEntity[]
  deadline: string
}
