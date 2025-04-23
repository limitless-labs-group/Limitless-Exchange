import { atom } from 'jotai'
import { defaultFormData } from '@/app/draft/components'
import { Market, MarketType } from '@/types'
import { DraftMarket, DraftMarketType, IFormData, MarketInput } from '@/types/draft'

const def = {
  title: '',
  description: '',
  settings: { rewardsEpoch: 0.20833, maxSpread: 3, minSize: 100, c: 3 },
}

export type CreateMarketModalMarket = {
  market: DraftMarket | Market
  type: 'active' | 'draft'
  marketType: DraftMarketType
  mode: 'create' | 'edit'
}

export const defaultGroupMarkets = [{ ...def }, { ...def }]

export const formDataAtom = atom<IFormData>(defaultFormData)
export const marketTypeAtom = atom<boolean>()
export const draftMarketTypeAtom = atom<DraftMarketType>('amm')
export const groupMarketsAtom = atom<MarketInput[]>(defaultGroupMarkets)

export const modalMarketAtom = atom<CreateMarketModalMarket | null>(null)

// Atom for create market modal state
export const createMarketModalAtom = atom<boolean>(false)
