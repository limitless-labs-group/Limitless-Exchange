import { Token } from '@/types'
import { base, baseSepolia, goerli } from 'viem/chains'

export const collateralToken: Token = {
  address: {
    // [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    [base.id]: '0xFd9dc7e303654d910b2B30C1CaAEfa6E4EEc71Dd', // mock
    [baseSepolia.id]: '0xa0DdED488E88a396096745CF4F3865210b45e217',
    [goerli.id]: '0x80636966DDcFAEAD9C5793bf9e2E44d7CbED90fc',
  },
  symbol: 'USDC',
  decimals: 6,
  imageURI: 'https://assets.ramp.network/crypto-assets/usdc.svg',
}
