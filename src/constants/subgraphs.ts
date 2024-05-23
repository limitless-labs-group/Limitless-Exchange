import { base, baseSepolia } from 'viem/chains'

export const subgraphURI = {
  [base.id]: 'https://api.studio.thegraph.com/query/67933/base-mainnet-production/hanson-v0.1.4', // prod
  // [base.id]: 'https://api.studio.thegraph.com/query/67933/base-mainnet-test/hanson-v0.1.2', // dev
  [baseSepolia.id]:
    'https://api.studio.thegraph.com/query/67933/limitless-markets-base-sepolia/v0.1.3',
}

export const newSubgraphURI = {
  [base.id]: 'https://indexer.bigdevenergy.link/63e0e99/v1/graphql',
  [baseSepolia.id]: 'https://indexer.bigdevenergy.link/63e0e99/v1/graphql',
}
