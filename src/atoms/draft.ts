import { atom } from 'jotai'
import { defaultFormData } from '@/app/draft/components'
import { IFormData } from '@/types/draft'

export const formDataAtom = atom<IFormData>(defaultFormData)
export const marketTypeAtom = atom<boolean>()
