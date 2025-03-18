export interface FormFieldProps {
  label: string
  children: React.ReactNode
}

export interface IFormData {
  deadline: Date
  timezone: string
  title: string
  token: {
    symbol: string
    id: number
  }
  description: string
  liquidity: number
  probability: number
  marketFee: number
  tag: SelectOption[]
  creatorId: string
  categories: SelectOption[]
  ogLogo: File | undefined
  isBannered: boolean
  txHash: string
}

export interface TokenLimit {
  min: number
  max: number
  default?: number
  step: number
}

export interface TokenLimits {
  [key: string]: TokenLimit
}

export interface SelectOption {
  id: string
  label: string
  value: string
}

export interface Tag {
  id: string
  name: string
  createdAt: string
}

export interface DraftCategory {
  id: number
  name: string
  priority: null | number
}

export interface Creator {
  id: string
  name: string
}

export interface Token {
  id: number
  symbol: string
}

export interface DraftMarketResponse {
  id: number
  title: string
  description: string
  deadline: string
  collateralToken: {
    id: number
    name: string
    symbol: string
    decimals: number
    priceOracleId: string
    address: string
    logoUrl: string
  }
  creator: {
    id: number
    account: string
    username: string
    displayName: string
    bio: string
    client: null
    pfpUrl: null | string
    smartWallet: null | string
    isCreator: boolean
    isAdmin: boolean
    socialUrl: null | string
  }
  tags: Tag[]
  categories: DraftCategory[]
  type?: 'clob' | 'amm'
  draftMetadata: {
    fee: number
    type?: 'clob' | 'amm'
  }
}
