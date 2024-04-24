import { base, baseSepolia } from 'viem/chains'

export const subgraphURI = {
  [base.id]: 'https://api.studio.thegraph.com/query/67933/base-mainnet-production/hanson-v0.1.2', // prod
  // [base.id]: 'https://api.studio.thegraph.com/query/67933/base-mainnet-test/hanson-v0.1.2', // dev
  [baseSepolia.id]:
    'https://api.studio.thegraph.com/query/67933/limitless-markets-base-sepolia/hanson-sepolia-v0.1.1',
}
