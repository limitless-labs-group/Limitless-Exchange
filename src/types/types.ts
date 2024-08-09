import { Hash, Address } from 'viem'

export type { Hash, Address }

export type Token = {
  address: Address
  symbol: string
  decimals: number
  name: string
  logoUrl: string
  priceOracleId: MarketTokensIds
  id: MarketTokensIds
}

export type Category = {
  id: number
  name: string
}

export type MarketData = {
  data: Market[]
  next: number
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
  createdAt: number
  expired?: boolean
  tokenTicker: {
    [chainId: number]: string
  }
  tokenURI: {
    [chainId: number]: string
  }
  creator: {
    name: string
    imageURI?: string
    link?: string
  }
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

export type Market = MarketResponse & {
  buyYesNo: number[]
  sellYesNo?: number[]
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
  buyYesNo: number[]
  sellYesNo?: number[]
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
}
