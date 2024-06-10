import { base, baseSepolia } from 'viem/chains'

import type { Address } from '@/types'

export const conditionalTokensAddress: { [chainId: number]: Address } = {
  [base.id]: '0x15A61459d65D89A25a9e91e0dc9FC69598791505', // prod
  // [base.id]: '0x983d539551B219dd40A034Dd63071F1C24b96fcd', // dev
  [baseSepolia.id]: '0xBe5201F570d405b79273DCeB90AAc7210059caE7',
}
