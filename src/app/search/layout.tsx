'use client'

import { PropsWithChildren } from 'react'
import { MainLayout } from '@/components'

const SearchLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>
}

export default SearchLayout
