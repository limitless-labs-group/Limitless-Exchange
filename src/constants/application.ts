import { base, baseSepolia } from 'viem/chains'

export const LOCAL_STORAGE_VERSION_NAME = 'limitless_exchange_build_version'
export const POLLING_INTERVAL = 5000 //in ms
export const LIMIT_PER_PAGE = 25

export const draftMarketAddress = {
  [base.id]: '0x32e52896663De88a65c2D94917b006404415A89f',
  [baseSepolia.id]: '0x4c3C0583dEb9E081b2481FB26E8e5aD914Dcee23',
}
