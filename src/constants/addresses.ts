import { Address } from '@/types'
import { base, baseSepolia, goerli } from 'viem/chains'

export const conditionalTokensAddress: { [chainId: number]: Address } = {
  [base.id]: '0x7FC645Ad1e0D69E679952C40B4D2BebcD38B7018',
  [baseSepolia.id]: '0x2E27CB9E48500fABEdf172DB8e7Bff8c2D564F2c',
  [goerli.id]: '0x1DC633D3f9b89610B80f9d3aB2BeE59228ca3fA1',
}
