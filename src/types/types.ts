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
}

export enum Sort {
  BASE = '',
  NEWEST = 'Newest',
  COMING_DEADLINE = 'Coming Soon',
  HIGHEST_LIQUIDITY = 'High Liquidity',
  HIGHEST_VOLUME = 'High Volume',
}

export type GetCoingeckoPricesResponse = Record<MarketTokensIds, CoingeckoPriceEntity>

export type OddsData = {
  buyYesNo: number[]
  sellYesNo?: number[]
}
