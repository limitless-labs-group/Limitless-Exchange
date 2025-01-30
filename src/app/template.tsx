'use client'

import Intercom from '@intercom/messenger-js-sdk'
import { PropsWithChildren, useEffect } from 'react'
import { LOCAL_STORAGE_VERSION_NAME } from '@/constants/application'
import { useTotalTradingVolume } from '@/hooks/use-total-trading-volume'
import { useAccount } from '@/services'
import packageInfo from '../../package.json'

export default function Template({ children }: PropsWithChildren) {
  const { disconnectFromPlatform } = useAccount()
  useTotalTradingVolume()

  const currentAppVersion = packageInfo.version

  Intercom({
    app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID as string,
  })

  // useEffect(() => {
  //   const currentUsersVersion = localStorage.getItem(LOCAL_STORAGE_VERSION_NAME)
  //
  //   if (!currentUsersVersion) {
  //     localStorage.clear()
  //     localStorage.setItem(LOCAL_STORAGE_VERSION_NAME, currentAppVersion)
  //     return
  //   }
  //   if (currentAppVersion !== currentUsersVersion) {
  //     localStorage.clear()
  //     localStorage.setItem(LOCAL_STORAGE_VERSION_NAME, currentAppVersion)
  //     disconnectFromPlatform()
  //     return
  //   }
  // }, [currentAppVersion])

  return <div>{children}</div>
}
