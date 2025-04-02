import { atom } from 'jotai'
import { defaultFormData } from '@/app/draft/components'
import { DraftMarketType, IFormData, MarketInput } from '@/types/draft'

export const defaultGroupMarkets = [
  { title: '', description: '' },
  { title: '', description: '' },
]

export const formDataAtom = atom<IFormData>(defaultFormData)
export const marketTypeAtom = atom<boolean>()
export const draftMarketTypeAtom = atom<DraftMarketType>('amm')
export const groupMarketsAtom = atom<MarketInput[]>(defaultGroupMarkets)
