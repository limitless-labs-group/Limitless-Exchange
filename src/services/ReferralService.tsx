'use client'

import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAxiosPrivateClient } from './AxiosPrivateClient'
import { USER_ID } from '@/utils/consts'

export function isUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false

  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[\w-.~:@!$&'()*+,;=]*)*$/i
  return urlPattern.test(value)
}

export const useReferral = () => {
  const privateClient = useAxiosPrivateClient()
  const [visitorId, setVisitorId] = useState<string>('Guest')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVisitorId(localStorage.getItem(USER_ID) ?? 'Guest')
    }
  }, [])
  const {
    mutateAsync: sendVisit,
    isPending,
    isSuccess,
  } = useMutation({
    mutationKey: ['referral-visits'],
    mutationFn: async ({ pageUrl, referralCode }: IUseSendVisit): Promise<ReferralVisitsPost> => {
      const res = await privateClient.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/referral-visits`,
        {
          pageUrl: pageUrl,
          visitorId,
          referralCode,
        }
      )
      return res.data
    },
    onError: (error) => {
      console.error('Error tracking referral visit:', error)
    },
  })

  return {
    sendVisit,
    isPending,
    isSuccess,
  }
}

export interface IUseSendVisit {
  pageUrl: string
  referralCode: string
}

export interface ReferralVisitsPost {
  id: string
  createAt: string
  pageUrl: string
  visitorId: string
  referralId: string
  referralCode: string
  ipAddress: string
}
