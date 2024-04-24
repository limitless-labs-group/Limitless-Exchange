import { Token } from '@/types'
import { base, baseSepolia } from 'viem/chains'

export const usdc: Token = {
  address: {
    // [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    [base.id]: '0xFd9dc7e303654d910b2B30C1CaAEfa6E4EEc71Dd', // Mock
    [baseSepolia.id]: '0xa0DdED488E88a396096745CF4F3865210b45e217',
  },
  symbol: 'USDC',
  decimals: 6,
  imageURI: 'https://assets.ramp.network/crypto-assets/usdc.svg',
}

export const weth: Token = {
  address: {
    // [base.id]: '0x4200000000000000000000000000000000000006',
    [base.id]: '0x0F654BAEc6Fd510309A3A8F3461F8d73e7EeF2B3', // Mock
    [baseSepolia.id]: '0x9e1cfdAdAf5631A40d9AD3f21233a177DF05b674',
  },
  symbol: 'WETH',
  name: 'Wrapped Ethereum',
  decimals: 18,
  imageURI: '/assets/images/weth.png',
}

export const collateralToken = weth
