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
}

export type MarketsResponse = {
  data: (Market | MarketGroup)[]
  totalMarketsCount: number
}

export interface Creator {
  name: string
  imageURI?: string
  imageUrl?: string // TODO: unify imageURI and imageUrl from backend
  link?: string
  address?: string
}

export type DraftMetadata = {
  fee: number
  liquidity: number
  initialProbability: number
}

export interface Market {
  address: Address
  category: Category | string
  collateralToken: {
    address: Address
    decimals: number
    symbol: string
  }
  conditionId: string
  createdAt: string
  creator: Creator
  description: string
  expirationDate: string
  expirationTimestamp: number
  expired: boolean
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
  group?: {
    id: number
    slug: string
    title: string
  }
}

export interface MarketGroup {
  slug: string
  hidden: boolean
  outcomeTokens: string[]
  title: string
  ogImageURI: string
  expirationDate: string
  expired: boolean
  expirationTimestamp: number
  creator: Creator
}

export interface DraftMarket extends Market {
  draftMetadata: DraftMetadata
}

export interface MarketGroup {
  category: Category
  collateralToken: {
    symbol: string
    address: Address
    decimals: number
  }
  tags: string[]
  createdAt: string
  status: MarketStatus
  markets: Market[]
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
  NEWEST = 'Newest',
  ENDING_SOON = 'Ending Soon',
  HIGHEST_LIQUIDITY = 'High Liquidity',
  HIGHEST_VOLUME = 'High Volume',
}

export enum MarketStatus {
  RESOLVED = 'RESOLVED',
  FUNDED = 'FUNDED',
  LOCKED = 'LOCKED',
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
    white: string
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
    200: string
    300: string
    700: string
  }
  blackTransparent: {
    200: string
    600: string
  }
  greyTransparent: {
    200: string
    600: string
  }
  blackStale: {
    200: string
  }
}

export interface RedeemParams {
  outcomeIndex: number
  marketAddress: Address
  collateralAddress: Address
  conditionId: Address
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

export interface CommentType {
  id: string
  createdAt: string
  content: string
  author: Profile
}

export type APIError = AxiosError<{ message: string; statusCode: number }>
