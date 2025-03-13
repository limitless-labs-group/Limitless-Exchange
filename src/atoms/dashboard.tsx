import { atom } from 'jotai'

export type Dashboard = 'crash'

export const dashboardAtom = atom<{ name: Dashboard } | null>(null)
