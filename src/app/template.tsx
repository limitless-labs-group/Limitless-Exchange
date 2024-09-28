'use client'

import { PropsWithChildren, useEffect } from 'react'
import packageInfo from '../../package.json'
import { LOCAL_STORAGE_VERSION_NAME } from '@/constants/application'
import { useAccount } from '@/services'
import { useTotalTradingVolume } from '@/hooks/use-total-trading-volume'

export default function Template({ children }: PropsWithChildren) {
  const { disconnectFromPlatform } = useAccount()
  useTotalTradingVolume()

  const currentAppVersion = packageInfo.version

  useEffect(() => {
    const currentUsersVersion = localStorage.getItem(LOCAL_STORAGE_VERSION_NAME)

    if (!currentUsersVersion) {
      localStorage.clear()
      localStorage.setItem(LOCAL_STORAGE_VERSION_NAME, currentAppVersion)
      disconnectFromPlatform()
      return
    }
    if (currentAppVersion !== currentUsersVersion) {
      localStorage.clear()
      localStorage.setItem(LOCAL_STORAGE_VERSION_NAME, currentAppVersion)
      disconnectFromPlatform()
      return
    }
  }, [currentAppVersion])

  return <div>{children}</div>
}
