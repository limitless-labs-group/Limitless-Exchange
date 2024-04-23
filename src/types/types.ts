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
  outcomeTokens: string[]
  questionId: Hash
  conditionId: Hash
  title: string
  imageURI?: string
  description: string
  expirationData: string
  creator: {
    name: string
    imageURI?: string
    link?: string
  }
  closed?: boolean
}

export type GetBalanceResult = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}
