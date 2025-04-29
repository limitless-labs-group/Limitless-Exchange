'use client'

import { useEffect } from 'react'
import { useUrlParams } from '@/hooks/use-url-param'
import { useReferral } from '@/services/ReferralService'

export const ReferralProvider = () => {
  const { getParam } = useUrlParams()
  const { sendVisit } = useReferral()
  const referral = getParam('r')
  useEffect(() => {
    if (referral) {
      let fullPageUrl = ''
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('r')
        fullPageUrl = url.toString()
      }
      sendVisit({ referralCode: referral, pageUrl: fullPageUrl }).finally(() => {
        // updateParams({ r: null })
      })
    }
  }, [])

  return null
}
