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
    [baseSepolia.id]: '0x9BdC18f92D2c39D2608De4C9c194fD34316Fd333', // dev
  },
  symbol: 'DEGEN',
  name: 'Degen (Base)',
  decimals: 18,
  imageURI: '/assets/images/tokens/degen.svg',
  id: MarketTokensIds.DEGEN,
}

export const regen: Token = {
  address: {
    [base.id]: '0x1a2ba71e69a2ad9ff40555b30586bba0efcd7616', // Todo change to prod
    [baseSepolia.id]: '0xC5d6363289975607d8f5F0692E73f0e2C6Cc705C',
  },
  symbol: 'REGEN',
  name: 'Regen',
  decimals: 18,
  imageURI: '/assets/images/tokens/regen.svg',
  id: MarketTokensIds.REGEN,
}

export const higher: Token = {
  address: {
    [base.id]: '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe',
    [baseSepolia.id]: '0x2b85c67F25d05731C1cD4dCf164c4FCAFa642C1b',
  },
  symbol: 'HIGHER',
  name: 'higher',
  decimals: 18,
  imageURI: '/assets/images/tokens/higher.svg',
  id: MarketTokensIds.HIGHER,
}

export const mfer: Token = {
  address: {
    [base.id]: '0xe3086852a4b125803c815a158249ae468a3254ca',
    [baseSepolia.id]: '0x1456D2B6473438536b4eD6588b901B8A2670D757',
  },
  symbol: 'MFER',
  name: 'mfercoin',
  decimals: 18,
  imageURI: '/assets/images/tokens/mfer.png',
  id: MarketTokensIds.MFER,
}

export const onChain: Token = {
  address: {
    [base.id]: '0xfef2d7b013b88fec2bfe4d2fee0aeb719af73481',
    [baseSepolia.id]: '0xFAa2aB170434b3583E8dE536cB6Db910f892D9c0',
  },
  symbol: 'ONCHAIN',
  name: '/onchain',
  decimals: 18,
  imageURI: '/assets/images/tokens/onchain.png',
  id: MarketTokensIds.ONCHAIN,
}

export const collateralTokensArray = [weth, onChain]

export const collateralToken = weth
