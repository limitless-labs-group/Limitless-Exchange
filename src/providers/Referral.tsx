'use client'

import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { accountAtom } from '@/atoms/account'
import { useUrlParams } from '@/hooks/use-url-param'
import { ChangeEvent, useAccount, useAmplitude } from '@/services'
import { useReferral } from '@/services/ReferralService'

export const ReferralProvider = () => {
  const { updateParams, getParam } = useUrlParams()
  const { sendVisit } = useReferral()
  const referral = getParam('rv')
  const { trackChanged } = useAmplitude()
  const { account, referralCode } = useAccount()
  const hasTrackedRef = useRef(false)
  const [acc] = useAtom(accountAtom)

  useEffect(() => {
    if (!referralCode || !referral) return
    if (referral && !hasTrackedRef.current && account) {
      if (referralCode === referral) return
      hasTrackedRef.current = true
      let fullPageUrl = ''
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        trackChanged(ChangeEvent.TrackVisit, {
          refCode: referral,
          user: acc?.account ?? account ?? 'Guest',
        })
        url.searchParams.delete('rv')
        fullPageUrl = url.toString()
        sendVisit({ referralCode: referral, pageUrl: fullPageUrl }).then(() =>
          updateParams({ rv: null })
        )
      }
    }
  }, [referral, account, referralCode])

  return null
}
