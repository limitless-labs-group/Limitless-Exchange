import { atom } from 'jotai'

export const accountAtom = atom<{ account: string } | null>(null)
