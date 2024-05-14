import { MarketTokensIds, Token } from '@/types'
import { base, baseSepolia } from 'viem/chains'

// export const usdc: Token = {
//   address: {
//     [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // prod
//     // [base.id]: '0xFd9dc7e303654d910b2B30C1CaAEfa6E4EEc71Dd', // dev
//     [baseSepolia.id]: '0xa0DdED488E88a396096745CF4F3865210b45e217',
//   },
//   symbol: 'USDC',
//   name: 'USDC token',
//   decimals: 6,
//   imageURI: 'https://assets.ramp.network/crypto-assets/usdc.svg',
// }

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
  id: MarketTokensIds.ETH,
}

export const degen: Token = {
  address: {
    [base.id]: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
    [baseSepolia.id]: '0xca8cd401a4560a0d1b158f8292b85c78cb38ffc1', // dev
  },
  symbol: '$DEGEN',
  name: 'degen market',
  decimals: 18,
  imageURI: '/assets/images/tokens/degen.svg',
  id: MarketTokensIds.DEGEN,
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
  id: MarketTokensIds.REGEN,
}

export const higher: Token = {
  address: {
    [base.id]: '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe',
    [baseSepolia.id]: '0x729873aa483ced60acb0b7ad815f14c8a7794930',
  },
  symbol: '$HIGHER',
  name: 'higher market',
  decimals: 18,
  imageURI: '/assets/images/tokens/higher.svg',
  id: MarketTokensIds.HIGHER,
}

export const mfer: Token = {
  address: {
    [base.id]: '0xe3086852a4b125803c815a158249ae468a3254ca',
    [baseSepolia.id]: '0xf2317d0d51795c1dc779462d10c407de6e8a47cb',
  },
  symbol: '$MFER',
  name: 'mfer market',
  decimals: 18,
  imageURI: '/assets/images/tokens/mfer.png',
  id: MarketTokensIds.MFER,
}

export const onChain: Token = {
  address: {
    [base.id]: '0xfef2d7b013b88fec2bfe4d2fee0aeb719af73481',
    [baseSepolia.id]: '0x5e116ea80879d528041919e589cb88382c3745E0',
  },
  symbol: '$ONCHAIN',
  name: '/onchain market',
  decimals: 18,
  imageURI: '/assets/images/tokens/onchain.png',
  id: MarketTokensIds.ONCHAIN,
}

export const collateralTokensArray = [higher, weth, degen, regen, mfer, onChain]

export const collateralToken = weth
