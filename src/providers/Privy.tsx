'use client'

import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth'
import { defaultChain } from '@/constants'
import { QueryProvider } from '@/providers/ReactQuery'
import { WagmiProvider } from '@privy-io/wagmi'
import { createPublicClient, Transport } from 'viem'

export const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http(),
})

const configureChainsConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [defaultChain.id]: http(),
  } as Record<8453 | 84532, Transport>,
})

const privvyConfig: PrivyClientConfig = {
  // Customize Privy's appearance in your app
  appearance: {
    theme: 'light',
    accentColor: '#2492ff',
    logo: 'https://limitless-web.vercel.app/assets/images/logo.svg',
  },
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
  defaultChain: defaultChain,
  supportedChains: [baseSepolia, base],
  loginMethods: ['email', 'wallet', 'google', 'apple', 'farcaster'],
}

export default function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider appId='clvpba9ig01ur2dl8ut64mfn4' config={privvyConfig}>
      <QueryProvider>
        <WagmiProvider config={configureChainsConfig}>{children}</WagmiProvider>
      </QueryProvider>
    </PrivyProvider>
  )
}
