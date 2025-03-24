'use client'

import { useMutation } from '@tanstack/react-query'
import { useAxiosPrivateClient } from './AxiosPrivateClient'
import { USER_ID } from '@/utils/consts'

export function isUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false

  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[\w-.~:@!$&'()*+,;=]*)*$/i
  return urlPattern.test(value)
}

export const useReferral = () => {
  const privateClient = useAxiosPrivateClient()
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
          pageUrl: isUrl(pageUrl) ? pageUrl : 'https://limitless.exchange',
          visitorId: localStorage.getItem(USER_ID) ?? 'Guest',
          referralCode,
          ipAddress: '0.0.0.0',
        }
      )
      return res.data
    },
    onSuccess: () => {
      console.log('Referral visit tracked successfully')
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
