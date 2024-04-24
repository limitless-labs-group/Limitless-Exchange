import { Address } from '@/types'
import { base, baseSepolia } from 'viem/chains'

export const conditionalTokensAddress: { [chainId: number]: Address } = {
  [base.id]: '0x983d539551B219dd40A034Dd63071F1C24b96fcd',
  [baseSepolia.id]: '0xBe5201F570d405b79273DCeB90AAc7210059caE7',
}
