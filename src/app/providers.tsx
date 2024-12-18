'use client'

import * as React from 'react'
import { TokenFilterProvider } from '@/contexts/TokenFilterContext'
import {
  QueryProvider,
  WagmiProvider,
  Web3AuthProvider,
  PriceOracleProvider,
  ThemeProvider,
} from '@/providers'
import RainbowProvider from '@/providers/Rainbow'
import {
  AccountProvider,
  AmplitudeProvider,
  BalanceServiceProvider,
  EtherspotProvider,
  LimitlessApiProvider,
  TradingServiceProvider,
  CommentServiceProvider,
} from '@/services'
import { AxiosProvider } from '@/services/AxiosPrivateClient'

export const Providers = ({ children }: React.PropsWithChildren) => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    mounted && (
      <ThemeProvider>
        <QueryProvider>
          <WagmiProvider>
            <RainbowProvider>
              <Web3AuthProvider>
                <AmplitudeProvider>
                  <LimitlessApiProvider>
                    <EtherspotProvider>
                      <AxiosProvider>
                        <AccountProvider>
                          <PriceOracleProvider>
                            <BalanceServiceProvider>
                              <TokenFilterProvider>
                                <CommentServiceProvider>
                                  <TradingServiceProvider>{children}</TradingServiceProvider>
                                </CommentServiceProvider>
                              </TokenFilterProvider>
                            </BalanceServiceProvider>
                          </PriceOracleProvider>
                        </AccountProvider>
                      </AxiosProvider>
                    </EtherspotProvider>
                  </LimitlessApiProvider>
                </AmplitudeProvider>
              </Web3AuthProvider>
            </RainbowProvider>
          </WagmiProvider>
        </QueryProvider>
      </ThemeProvider>
    )
  )
}
