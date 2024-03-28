export type Address = `0x${string}`

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
  conditionId: Address
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
