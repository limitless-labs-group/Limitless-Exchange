'use client'

import { PropsWithChildren } from 'react'
import { MainLayout } from '@/components'

export default function AdminLayout({ children }: PropsWithChildren) {
  return <MainLayout>{children}</MainLayout>
}
