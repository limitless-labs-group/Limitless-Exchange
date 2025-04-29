import { base, baseSepolia } from 'viem/chains'

export const newSubgraphURI = {
  [base.id]:
    process.env.NEXT_PUBLIC_SUBGRAPH_URL ?? 'https://indexer.hyperindex.xyz/da7c4d3/v1/graphql',
  [baseSepolia.id]:
    process.env.NEXT_PUBLIC_SUBGRAPH_URL ?? 'https://index.dev.limitless.exchange/v1/graphql',
}
