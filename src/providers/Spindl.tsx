'use client'

import spindl from '@spindl-xyz/attribution'
import { useEffect } from 'react'

export const SpindlProvider = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SPINDL_SDK_KEY !== 'development') {
      spindl.configure({
        sdkKey: process.env.NEXT_PUBLIC_SPINDL_SDK_KEY ?? '',
        host: `${window.location.origin}/ingest`,
      })

      spindl.enableAutoPageViews()
    }
  }, [])

  return null
}
