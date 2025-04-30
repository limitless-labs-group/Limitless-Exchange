'use client'

import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth'
import { RPCs } from 'csp.config.js'
import { PropsWithChildren } from 'react'
import { createPublicClient, fallback, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { defaultChain } from '@/constants'
import { useThemeProvider } from '@/providers/Chakra'
import { QueryProvider } from '@/providers/ReactQuery'

export const publicClient = createPublicClient({
  chain: defaultChain,
  transport:
    process.env.NEXT_PUBLIC_NETWORK === 'testnet'
      ? http()
      : fallback(
          RPCs.map((rpc) => http(rpc)),
          { rank: true }
        ),
})

export default function PrivyAuthProvider({ children }: PropsWithChildren) {
  const { mode } = useThemeProvider()
  const privvyConfig: PrivyClientConfig = {
    appearance: {
      theme: mode,
      logo: 'https://limitless-web.vercel.app/assets/images/logo.svg',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      showWalletUIs: false,
    },
    fundingMethodConfig: {
      moonpay: {
        paymentMethod: 'credit_debit_card',
        uiConfig: { accentColor: 'var(--chakra-colors-blue-500)', theme: mode },
        useSandbox: process.env.NEXT_PUBLIC_NETWORK === 'testnet',
      },
    },
    defaultChain: defaultChain,
    supportedChains: [baseSepolia, base],
    loginMethods: ['email', 'wallet', 'google', 'farcaster', 'discord'],
    walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  }
  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string} config={privvyConfig}>
      <QueryProvider>
        {/*<WagmiProvider config={configureChainsConfig} reconnectOnMount={false}>*/}
        {children}
        {/*</WagmiProvider>*/}
      </QueryProvider>
    </PrivyProvider>
  )
}
