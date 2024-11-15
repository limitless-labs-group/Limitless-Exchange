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
  HistoryServiceProvider,
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
      <AmplitudeProvider>
        <ThemeProvider>
          <QueryProvider>
            <WagmiProvider>
              <RainbowProvider>
                <Web3AuthProvider>
                  <AxiosProvider>
                    <LimitlessApiProvider>
                      <EtherspotProvider>
                        <AccountProvider>
                          <PriceOracleProvider>
                            <BalanceServiceProvider>
                              <HistoryServiceProvider>
                                <TokenFilterProvider>
                                  <CommentServiceProvider>
                                    <TradingServiceProvider>{children}</TradingServiceProvider>
                                  </CommentServiceProvider>
                                </TokenFilterProvider>
                              </HistoryServiceProvider>
                            </BalanceServiceProvider>
                          </PriceOracleProvider>
                        </AccountProvider>
                      </EtherspotProvider>
                    </LimitlessApiProvider>
                  </AxiosProvider>
                </Web3AuthProvider>
              </RainbowProvider>
            </WagmiProvider>
          </QueryProvider>
        </ThemeProvider>
      </AmplitudeProvider>
    )
  )
}
