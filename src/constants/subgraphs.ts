import { base, baseSepolia, goerli } from 'viem/chains'

export const subgraphURI = {
  [base.id]: 'https://api.studio.thegraph.com/proxy/67933/limitless-markets-base/version/latest',
  [baseSepolia.id]:
    'https://api.studio.thegraph.com/query/67933/limitless-markets-base-sepolia/hanson-v0.0.15',
  [goerli.id]: 'https://api.studio.thegraph.com/proxy/67765/limitless-labs/version/latest',
}
