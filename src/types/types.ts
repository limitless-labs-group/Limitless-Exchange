import type { Hash, Address } from 'viem'

export type { Hash, Address }

export type Token = {
  address: {
    [chainId: number]: Address
  }
  symbol: string
  decimals: number
  name: string
  imageURI: string
  id: MarketTokensIds
}

export type Market = {
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

export enum MarketTokensIds {
  DEGEN = 'degen-base',
  ETH = 'ethereum',
  WETH = 'ethereum',
  HIGHER = 'higher',
  MFER = 'mfercoin',
  ONCHAIN = 'onchain',
  REGEN = 'regen',
  USDC = 'usdc',
}

export type GetCoingeckoPricesResponse = Record<MarketTokensIds, CoingeckoPriceEntity>
