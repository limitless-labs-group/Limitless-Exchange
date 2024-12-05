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
  tag: TagOption[]
  creatorId: string
  categoryId: string
  ogLogo: File | undefined
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

export interface TagOption {
  id: string
  label: string
  value: string
}

export interface Tag {
  id: string
  name: string
  createdAt: string
}

export interface Creator {
  id: string
  name: string
}

export interface Token {
  id: number
  symbol: string
}
