'use client'

import { PropsWithChildren } from 'react'
import { MainLayout } from '@/components'

const PortfolioLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>
}

export default PortfolioLayout
