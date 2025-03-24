import { Category, DraftMetadata, MarketType } from './types'

export interface FormFieldProps {
  label: string
  children: React.ReactNode
}
export type DraftMarket = {
  id: number
  title: string
  description: string
  deadline: string
  tags: any
  collateralToken: Token
  categories: Category[]
  creator: DraftCreator
  type: MarketType
  draftMetadata: DraftMetadata
  metadata: {
    isBannered: false
  }
  settings: Settings
}

export interface Settings {
  priorityIndex?: number
  rewardsEpoch?: number
  maxSpread?: number
  minSize?: number
  c?: number
}

export interface IFormData {
  deadline: Date
  timezone: string
  title: string
  token: {
    symbol: string
    id: number
  }
  description: string
  liquidity: number
  probability: number
  marketFee: number
  tag: SelectOption[]
  creatorId: string
  categories: SelectOption[]
  ogLogo: File | undefined
  isBannered: boolean
  txHash: string
  priorityIndex?: number
  maxDailyReward?: number
  maxSpread?: number
  minSize?: number
  c?: number
}

export interface TokenLimit {
  min: number
  max: number
  default?: number
  step: number
}

export interface TokenLimits {
  [key: string]: TokenLimit
}

export interface SelectOption {
  id: string
  label: string
  value: string
}

export interface Tag {
  id: string
  name: string
  createdAt: string
}

export interface DraftCategory {
  id: number
  name: string
  priority: null | number
}

export interface Creator {
  id: number
  account: string
  username: string
  displayName: string
  bio: string
  client: null
  pfpUrl: null | string
  smartWallet: null | string
  isCreator: boolean
  isAdmin: boolean
  socialUrl: null | string
  referralCode: string
}

export interface DraftCreator {
  id: number
  name: string
}

export interface Token {
  id: number
  symbol: string
}

export interface DraftMarketResponse {
  id: number
  title: string
  description: string
  deadline: string
  collateralToken: Token
  creator: DraftCreator
  tags: Tag[]
  categories: DraftCategory[]
  type?: MarketType
  draftMetadata: {
    fee: number
    type?: MarketType
  }
}

export interface BaseMarketData {
  title: string
  description: string
  tokenId: number
  marketFee: number
  deadline: number
  isBannered: boolean
  creatorId: string
  categoryIds: string
  tagIds: string
}

export interface ClobMarketData extends BaseMarketData {
  minSize?: number
  maxSpread?: number
  c?: number
  rewardsEpoch?: number
}

export interface AmmMarketData extends BaseMarketData {
  liquidity: number
  initialYesProbability: number
}

export type MarketData = ClobMarketData | AmmMarketData
