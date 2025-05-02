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

export type MarketData = {
  data: Market[]
  next: number
}

export type Market = {
  outcomeTokensPercent: number[]
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
  prices: number[]
  tags?: string[]
  winningOutcomeIndex?: number | null
  volume?: string
  liquidity?: string
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
  COMING_DEADLINE = 'Coming Deadline',
  HIGHEST_LIQUIDITY = 'Highest Liquidity',
  HIGHEST_VOLUME = 'Highest Volume',
}

export type GetCoingeckoPricesResponse = Record<MarketTokensIds, CoingeckoPriceEntity>
