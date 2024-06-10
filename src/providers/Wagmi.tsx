// import { WagmiConfig, configureChains, createConfig } from 'wagmi'
// import { publicProvider } from 'wagmi/providers/public'
// import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import type { Transport } from 'viem'
import { createPublicClient } from 'viem'
import { WagmiProvider as WagmiDefaultProvider, http, createConfig } from 'wagmi'

import { defaultChain } from '@/constants'
import { web3AuthConnector } from '@/providers'

// const { publicClient, webSocketPublicClient } = configureChains(
//   [defaultChain],
//   [
//     // infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY ?? '' }),
//     jsonRpcProvider({
//       rpc: () => ({
//         http: defaultChain.rpcUrls.default.http[0],
//       }),
//     }),
//     publicProvider(),
//   ]
// )

const config = createConfig({
  chains: [defaultChain],
  transports: {
    [defaultChain.id]: http(),
  } as Record<8453 | 84532, Transport>,
  connectors: [web3AuthConnector],
})

export const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http(),
})

export const WagmiProvider = ({ children }: React.PropsWithChildren) => (
  <WagmiDefaultProvider reconnectOnMount={true} config={config}>
    {children}
  </WagmiDefaultProvider>
)
