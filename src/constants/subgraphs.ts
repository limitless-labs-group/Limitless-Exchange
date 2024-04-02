import { base, baseSepolia, goerli } from 'viem/chains'

export const subgraphURI = {
  [base.id]: 'https://api.studio.thegraph.com/proxy/67933/limitless-markets-base/version/latest',
  [baseSepolia.id]:
    'https://api.studio.thegraph.com/proxy/67933/limitless-markets-base-sepolia/version/latest',
  [goerli.id]: 'https://api.studio.thegraph.com/proxy/67765/limitless-labs/version/latest',
}
