import { Hash, Address } from 'viem'
import { AxiosError } from 'axios'

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

export type MarketData = {
  data: (MarketGroupCardResponse | MarketSingleCardResponse)[]
  next: number
}

export interface Creator {
  name: string
  imageURI?: string
  link?: string
  address?: string
}

interface Oracle {
  createdAt: string
  id: number
  name: string
  address: string
  imageUrl: string
}

export type MarketResponse = {
  address: {
    [chainId: number]: Address
  }
  questionId?: {
    [chainId: number]: Hash
  }
  conditionId: {
    [chainId: number]: Hash
  }
  collateralToken: {
    [chainId: number]: Address
  }
  hidden: {
    [chainId: number]: boolean
  }
  resolved: {
    [chainId: number]: boolean
  }
  outcomeTokens: string[]
  title: string
  proxyTitle: string | null
  description: string
  placeholderURI: string
  imageURI: string
  ogImageURI?: string
  expirationDate: string
  expirationTimestamp: number
  createdAt: string
  expired?: boolean
  tokenTicker: {
    [chainId: number]: string
  }
  tokenURI: {
    [chainId: number]: string
  }
  creator: Creator
  tags?: string[]
  winningOutcomeIndex?: number
  volume?: string
  volumeFormatted?: string
  liquidity?: string
  liquidityFormatted?: string
  prices: number[]
  category: string
  status: MarketStatus
}

export type MarketSingleCardResponse = {
  address: string
  title: string
  proxyTitle: string | null
  deadline: string
  createdAt: string
  volume: string
  volumeFormatted: string
  liquidity: string
  liquidityFormatted: string
  collateralToken: {
    symbol: string
    address: string
    decimals: number
  }
  category: string
  prices: number[]
}

export type MarketGroupCardResponse = {
  slug: string
  title: string
  createdAt: string
  deadline: string
  collateralToken: {
    symbol: string
    address: string
    decimals: number
  }
  markets: MarketSingleCardResponse[]
  category: string
}

export interface Market {
  address: Address
  conditionId: Address
  description: string
  collateralToken: {
    address: Address
    decimals: number
    symbol: string
  }
  title: string
  proxyTitle: string | null
  ogImageURI: string | null
  expirationDate: string
  expirationTimestamp: number
  winningOutcomeIndex: number | null
  expired: boolean
  tags: string[]
  volume: string
  volumeFormatted: string
  liquidity: string
  liquidityFormatted: string
  prices: number[]
  status: MarketStatus
  group?: {
    id: number
    title: string
    slug: string
  }
}

export interface SingleMarket extends Market {
  creator: Creator
}

export interface MarketGroup {
  category: Category
  collateralToken: {
    address: string
    decimals: number
    symbol: string
  }
  createdAt: string
  creator: Creator
  expirationDate: string
  expired: boolean
  hidden: boolean
  markets: Market[]
  ogImageURI: string
  outcomeTokens: string[]
  slug: string
  status: MarketStatus
  tags: string
  title: string
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

export type APIError = AxiosError<{ message: string; statusCode: number }>
