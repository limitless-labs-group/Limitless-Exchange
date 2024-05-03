import { Hash, Address } from 'viem'

export type { Hash, Address }

export type Token = {
  address: {
    [chainId: number]: Address
  }
  symbol: string
  decimals: number
  name?: string
  imageURI?: string
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
  outcomeTokens: string[]
  title: string
  description: string
  placeholderURI: string
  imageURI: string
  ogImageURI?: string
  expirationDate: string
  expirationTimestamp: number
  expired?: boolean
  creator: {
    name: string
    imageURI?: string
    link?: string
  }
  tags?: string[]
  winningOutcomeTokenId?: number
}

export type GetBalanceResult = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}
