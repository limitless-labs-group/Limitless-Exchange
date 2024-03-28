import { Address } from '@/types'
import { base, baseSepolia, goerli } from 'viem/chains'

export const conditionalTokensAddress: { [chainId: number]: Address } = {
  [base.id]: '0x7FC645Ad1e0D69E679952C40B4D2BebcD38B7018',
  [baseSepolia.id]: '0xc600379955C8d320ef7EE4335A33A7634A6f8543',
  [goerli.id]: '0x1DC633D3f9b89610B80f9d3aB2BeE59228ca3fA1',
}
