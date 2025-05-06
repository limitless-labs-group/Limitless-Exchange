import { atom } from 'jotai'
import { Sort } from '@/types'

export const sortAtom = atom<{ sort: Sort }>({ sort: Sort.DEFAULT })
