import { base, baseSepolia, goerli } from 'viem/chains'

export const subgraphURI = {
  [base.id]: 'https://api.studio.thegraph.com/proxy/67933/limitless-markets-base/version/latest',
  [baseSepolia.id]:
    'https://api.studio.thegraph.com/query/67933/limitless-markets-base-sepolia/hanson-sepolia-v0.1.1',
  [goerli.id]: 'https://api.studio.thegraph.com/proxy/67765/limitless-labs/version/latest',
}
