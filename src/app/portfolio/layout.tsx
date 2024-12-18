'use client'

import { PropsWithChildren } from 'react'
import { MainLayout } from '@/components'
import { HistoryServiceProvider } from '@/services'

const PortfolioLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <MainLayout>
      <HistoryServiceProvider>{children}</HistoryServiceProvider>
    </MainLayout>
  )
}

export default PortfolioLayout
