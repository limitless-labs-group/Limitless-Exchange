import { AxiosError } from 'axios'
import { Hash, Address } from 'viem'
import { Profile } from './profiles'

export type { Hash, Address }

export type Token = {
  address: Address
  symbol: string
  decimals: number
  name: string
  logoUrl: string
  priceOracleId: MarketTokensIds
  id: number
}

export type Category = {
  id: number
  name: string
  priority?: number | null
}

export type Dashboard = 'marketcrash'

export type MarketsResponse = {
  data: Market[]
  totalMarketsCount: number
}

export interface Creator {
  name: string
  imageURI: string | null
  imageUrl: string | null
  link: string | null
  address?: string
}

export type DraftMetadata = {
  fee: number
  liquidity: number
  initialProbability: number
}

export interface Market {
  id: number
  address: Address | null
  categories: string[]
  collateralToken: {
    address: Address
    decimals: number
    symbol: string
  }
  conditionId: string
  createdAt: string
  creator: Creator
  description: string
  deadline: string
  expirationDate: string
  expirationTimestamp: number
  expired: boolean
  negRiskMarketId?: string
  negRiskRequestId?: string
  liquidity: string
  liquidityFormatted: string
  ogImageURI: string
  proxyTitle: string | null
  status: MarketStatus
  tags: string[]
  title: string
  volume: string
  volumeFormatted: string
  winningOutcomeIndex: number | null
  prices: number[]
  slug: string
  group?: {
    id: number
    slug: string
    title: string
  }
  openInterest: string
  openInterestFormatted: string
  metadata: {
    isBannered: boolean
  }
  settings?: {
    minSize?: number
    maxSpread?: number
    c?: number
    rewardsEpoch?: number
  } | null
  priorityIndex: number
  tokens: {
    yes: string
    no: string
  }
  trends?: {
    [interval in Intervals]?: {
      value: number
      rank: number
    }
  }
  marketType: MarketType
  tradeType: MarketTradeType
  isRewardable: boolean
  markets?: Market[]
}

export type MarketType = 'single' | 'group'

export type MarketTradeType = 'clob' | 'amm'

export interface ApiResponse {
  data: Market[]
  totalMarketsCount: number
}

export interface MarketPage {
  data: {
    markets: Market[]
    totalAmount: number
  }
  next: number
}

export interface AnalyticsParams {
  bannerPosition: number
  bannerPaginationPage: number
  fromCategory?: string
}

export type Intervals = 'hourly' | 'last30days'

export interface UserMarket {
  title: string
  description: string
  expirationTimestamp: number
  expirationDate: string
  status: MarketStatus
  openInterestFormatted: string
  liquidityFormatted: string
  collateralToken: {
    address: string
    decimals: number
    symbol: string
  }
  initialProbability?: number
}

export type UserCreatedMarket = {
  id: number
  address: null | string
  title: string
  proxyTitle: null
  description: string
  questionId: string
  conditionId: null
  outcomeSlotCount: 2
  winningIndex: null
  payoutNumerators: null
  status: MarketStatus
  ogUrl: string
  imageUrl: null | string
  deadline: string
  hidden: boolean
  txHash: null | string
  resolutionTxHash: null | string
  draftMetadata: {
    fee: number
    liquidity: number
    initialProbability: number
  }
  priorityIndex: number
  token: Token
  creator: {
    id: number
    account: Address
    username: Address
    displayName: Address
    bio: string
    client: string
    pfpUrl: null | string
    smartWallet: null | string
    isCreator: boolean
    isAdmin: boolean
    socialUrl: null | string
  }
  tags: [
    {
      createdAt: string
      id: number
      name: string
    }
  ]
  oracle: {
    createdAt: string
    id: number
    name: string
    address: string
    imageUrl: string
  }
  category: Category
  marketsGroup: null
  slug: string
}

export interface DraftMarket extends Market {
  draftMetadata: DraftMetadata
  type?: MarketType
}

export type GetBalanceResult = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
  image: string
  name: string
  contractAddress: string
  price: number
  id: MarketTokensIds
}

type CoingeckoPriceEntity = { usd: number }

/**
 * coingecko ids
 */
export enum MarketTokensIds {
  DEGEN = 'degen-base',
  ETH = 'ethereum',
  WETH = 'ethereum',
  HIGHER = 'higher',
  MFER = 'mfercoin',
  ONCHAIN = 'onchain',
  REGEN = 'regen',
  USDC = 'usd-coin',
  VITA = 'vitadao',
  BETS = 'all-street-bets',
  GHST = 'aavegotchi',
  cbBTC = 'coinbase-wrapped-btc',
  aBasUSDC = 'aave-v3-usdc',
}

export enum Sort {
  BASE = '',
  DEFAULT = '🔥 Trending',
  NEWEST = 'Newest',
  ENDING_SOON = 'Ending Soon',
  HIGHEST_LIQUIDITY = 'High Liquidity',
  HIGHEST_VALUE = 'High Value',
  TRENDING = '🔥 Trending',
  LP_REWARDS = '💎 LP Rewards',
}

export enum SortStorageName {
  SORT = 'SORT',
  SORT_DAILY = 'SORT_DAILY',
}

export enum LeaderboardSort {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  ALL_TIME = 'All time',
}

export enum MarketStatus {
  RESOLVED = 'RESOLVED',
  FUNDED = 'FUNDED',
  LOCKED = 'LOCKED',
  PENDING = 'DRAFTED',
}

export type GetCoingeckoPricesResponse = Record<MarketTokensIds, CoingeckoPriceEntity>

export type OddsData = {
  prices: number[]
}

export interface ColorScheme {
  white: string
  black: string
  grey: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  red: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  pink: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  orange: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  yellow: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  lime: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  green: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  mint: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  cyan: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  blue: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  indigo: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  purple: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
  }
  transparent: {
    70: string
    50: string
    30: string
    20: string
  }
  transparentDark: {
    70: string
    50: string
    30: string
    20: string
  }
  whiteAlpha: {
    70: string
    50: string
    30: string
    20: string
  }
  blackAlpha: {
    70: string
    50: string
    30: string
    20: string
  }
  greyTransparent: {
    200: string
    600: string
  }
  greenTransparent: {
    100: string
  }
  redTransparent: {
    100: string
  }
  blueTransparent: {
    100: string
  }
  skeleton: {
    dark: string
    highLight: string
    tradeSkeleton: string
    tradeSkeletonBackground: string
    widgetYes: string
    widgetBgYes: string
    widgetNo: string
    widgetBgNo: string
    widgetGrey: string
    widgetBgGrey: string
  }
  draftCard: {
    bg: string
    border: string
    selectedBg: string
  }
}

export interface RedeemParams {
  outcomeIndex: number
  marketAddress: Address
  collateralAddress: Address
  conditionId: Address
  type: MarketType
}

export interface UpdateProfileData {
  isDirty: boolean
  displayName: string
  username: string
  pfpFile?: File
  bio?: string
}

export interface CommentPost {
  content: string
  market: Market
  author: Profile
  createdAt: string
  id: string
}
export interface CommentResponse {
  comments: Comment[]
  totalPages: number
}

export interface Like {
  createdAt: string
  id: number
  user: Profile
}

export interface CommentType {
  id: string
  createdAt: string
  content: string
  author: Profile
  likes: Like[]
}

export interface LikePost {
  message: string
}

export interface LikesGet {
  likes: number
}

export type APIError = AxiosError<{ message: string; statusCode: number }>

export enum MarketOrderType {
  LIMIT = 'limit',
  MARKET = 'market',
}

export interface MarketRewardsResponse {
  marketId: string
  marketSlug: string
  totalUnpaidReward: string
  unpaidRecords: string
  userId: string
}
