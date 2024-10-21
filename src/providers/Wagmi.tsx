// import { WagmiConfig, configureChains, createConfig } from 'wagmi'
// import { publicProvider } from 'wagmi/providers/public'
// import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createPublicClient } from 'viem'
import { WagmiProvider as WagmiDefaultProvider, http } from 'wagmi'
import { defaultChain } from '@/constants'
import { rainbowWeb3AuthConnector } from '@/providers'

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

export const config = getDefaultConfig({
  appName: 'Limitless Exchange',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  chains: [defaultChain],
  transports: {
    [defaultChain.id]: http(),
  },
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [
        rainbowWallet,
        rainbowWeb3AuthConnector,
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
  ],
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
