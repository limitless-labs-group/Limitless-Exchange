import { base, baseSepolia, goerli } from 'viem/chains'

export const subgraphURI = {
  [base.id]: 'https://api.studio.thegraph.com/query/67933/limitless-markets-base/base-mainnet',
  [baseSepolia.id]:
    'https://api.studio.thegraph.com/query/67933/limitless-markets-base-sepolia/v2.0.4',
  [goerli.id]: 'https://api.studio.thegraph.com/proxy/67765/limitless-labs/version/latest',
}
