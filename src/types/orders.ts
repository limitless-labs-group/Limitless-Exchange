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
