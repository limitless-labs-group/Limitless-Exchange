export interface ClobPosition {
  createdAt: string
  id: string
  makerAmount: string
  marketId: string
  originalSize: string
  ownerId: number
  price: string
  remainingSize: string
  side: 'SELL' | 'BUY'
  status: 'MATCHED' | 'LIVE'
  takerAmount: string
  token: string
  type: 'GTC' | 'FOK'
}

export interface ClobTradeEvent {
  createdAt: string
  txHash: string
  side: number
  price: number
  matchedSize: string
  profile: {
    id: number
    account: string
    username: null
    displayName: string
    bio: null | string
    client: 'eoa' | 'etherspot'
    pfpUrl: null | string
    smartWallet: null | string
    isCreator: boolean
    isAdmin: boolean
    socialUrl: null | string
  }
  tokenId: string
  takerAmount: string
  makerAmount: string
  title: string
}
