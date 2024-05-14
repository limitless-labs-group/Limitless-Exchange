import { Token } from '@/types'
import { base, baseSepolia } from 'viem/chains'

export const usdc: Token = {
  address: {
    [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // prod
    // [base.id]: '0xFd9dc7e303654d910b2B30C1CaAEfa6E4EEc71Dd', // dev
    [baseSepolia.id]: '0xa0DdED488E88a396096745CF4F3865210b45e217',
  },
  symbol: 'USDC',
  name: 'USDC token',
  decimals: 6,
  imageURI: 'https://assets.ramp.network/crypto-assets/usdc.svg',
}

export const weth: Token = {
  address: {
    [base.id]: '0x4200000000000000000000000000000000000006', // prod
    // [base.id]: '0x0F654BAEc6Fd510309A3A8F3461F8d73e7EeF2B3', // dev
    [baseSepolia.id]: '0x9e1cfdAdAf5631A40d9AD3f21233a177DF05b674',
  },
  symbol: 'WETH',
  name: 'Wrapped Ethereum',
  decimals: 18,
  imageURI: '/assets/images/tokens/weth.png',
}

export const degen: Token = {
  address: {
    [base.id]: '0xca8cd401a4560a0d1b158f8292b85c78cb38ffc1', // Todo change to prod
    [baseSepolia.id]: '0xca8cd401a4560a0d1b158f8292b85c78cb38ffc1', // dev
  },
  symbol: '$DEGEN',
  name: 'degen market',
  decimals: 18,
  imageURI: '/assets/images/tokens/degen.svg',
}

export const regen: Token = {
  address: {
    [base.id]: '0x1a2ba71e69a2ad9ff40555b30586bba0efcd7616', // Todo change to prod
    [baseSepolia.id]: '0x1a2ba71e69a2ad9ff40555b30586bba0efcd7616',
  },
  symbol: '$REGEN',
  name: 'regen market',
  decimals: 18,
  imageURI: '/assets/images/tokens/regen.svg',
}

export const higher: Token = {
  address: {
    [base.id]: '0x729873aa483ced60acb0b7ad815f14c8a7794930', // Todo change to prod
    [baseSepolia.id]: '0x729873aa483ced60acb0b7ad815f14c8a7794930',
  },
  symbol: '$HIGHER',
  name: 'higher market',
  decimals: 18,
  imageURI: '/assets/images/tokens/higher.svg',
}

export const mfer: Token = {
  address: {
    [base.id]: '0xE3086852A4B125803C815a158249ae468A3254Ca',
    [baseSepolia.id]: '0xf2317d0d51795c1dc779462d10c407de6e8a47cb',
  },
  symbol: '$MFER',
  name: 'mfer market',
  decimals: 18,
  imageURI: '/assets/images/tokens/mfer.png',
}

export const onChain: Token = {
  address: {
    [base.id]: '0xFeF2D7B013b88FEc2BFe4D2FEE0AEb719af73481',
    [baseSepolia.id]: '0x5e116ea80879d528041919e589cb88382c3745E0',
  },
  symbol: '$ONCHAIN',
  name: '/onchain market',
  decimals: 18,
  imageURI: '/assets/images/tokens/onchain.png',
}

export const collateralTokensArray = [higher, weth, degen, regen, mfer, onChain]

export const collateralToken = weth
