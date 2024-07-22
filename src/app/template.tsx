'use client'

import { PropsWithChildren, useEffect } from 'react'
import packageInfo from '../../package.json'
import { useDisconnect } from 'wagmi'
import { LOCAL_STORAGE_VERSION_NAME } from '@/constants/application'

export default function Template({ children }: PropsWithChildren) {
  const { disconnect } = useDisconnect()

  const currentAppVersion = packageInfo.version

  useEffect(() => {
    const currentUsersVersion = localStorage.getItem(LOCAL_STORAGE_VERSION_NAME)

    if (!currentUsersVersion) {
      localStorage.clear()
      localStorage.setItem(LOCAL_STORAGE_VERSION_NAME, currentAppVersion)
      disconnect()
      return
    }
    if (currentAppVersion !== currentUsersVersion) {
      localStorage.clear()
      localStorage.setItem(LOCAL_STORAGE_VERSION_NAME, currentAppVersion)
      disconnect()
      return
    }
  }, [currentAppVersion])

  return <div>{children}</div>
}
