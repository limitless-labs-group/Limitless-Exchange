'use client'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'
import { ClobWidgetProvider } from '@/components/common/markets/clob-widget/context'
import { TokenFilterProvider } from '@/contexts/TokenFilterContext'
import { QueryProvider, PriceOracleProvider, ThemeProvider } from '@/providers'
import PrivyAuthProvider from '@/providers/Privy'
import {
  AccountProvider,
  AmplitudeProvider,
  BalanceServiceProvider,
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
        <PrivyAuthProvider>
          <QueryProvider>
            <AmplitudeProvider>
              <LimitlessApiProvider>
                <AxiosProvider>
                  <AccountProvider>
                    <PriceOracleProvider>
                      <BalanceServiceProvider>
                        <TokenFilterProvider>
                          <CommentServiceProvider>
                            <TradingServiceProvider>
                              <ClobWidgetProvider>
                                {children}
                                <ReactQueryDevtools initialIsOpen={false} />
                              </ClobWidgetProvider>
                            </TradingServiceProvider>
                          </CommentServiceProvider>
                        </TokenFilterProvider>
                      </BalanceServiceProvider>
                    </PriceOracleProvider>
                  </AccountProvider>
                </AxiosProvider>
              </LimitlessApiProvider>
            </AmplitudeProvider>
          </QueryProvider>
        </PrivyAuthProvider>
      </ThemeProvider>
    )
  )
}
