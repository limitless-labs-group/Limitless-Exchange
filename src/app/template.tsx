'use client'

import Intercom from '@intercom/messenger-js-sdk'
import { PropsWithChildren, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { LOCAL_STORAGE_VERSION_NAME } from '@/constants/application'
import { useTotalTradingVolume } from '@/hooks/use-total-trading-volume'
import { useAccount } from '@/services'
import packageInfo from '../../package.json'

export const openIntercom = () => {
  if (typeof window !== 'undefined' && window.Intercom) {
    window.Intercom('show')
  }
}

export const closeIntercom = () => {
  if (typeof window !== 'undefined' && window.Intercom) {
    window.Intercom('hide')
  }
}

export default function Template({ children }: PropsWithChildren) {
  const { disconnectFromPlatform } = useAccount()
  useTotalTradingVolume()

  const currentAppVersion = packageInfo.version

  useEffect(() => {
    if (!isMobile) {
      Intercom({
        app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID as string,
        action_color: '#0079FF',
        hide_default_launcher: false,
      })
    } else {
      Intercom({
        app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID as string,
        action_color: '#0079FF',
        hide_default_launcher: true, // Hide the default launcher on mobile
      })
    }
  }, [])

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
