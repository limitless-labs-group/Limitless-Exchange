import { Address } from '@/types'
import { base, baseSepolia } from 'viem/chains'

export const conditionalTokensAddress: { [chainId: number]: Address } = {
  [base.id]: '0x7FC645Ad1e0D69E679952C40B4D2BebcD38B7018',
  [baseSepolia.id]: '0xBe5201F570d405b79273DCeB90AAc7210059caE7',
}
