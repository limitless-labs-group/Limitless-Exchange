import { AxiosResponse } from 'axios'
import { useMemo } from 'react'
import { MarketFeedData } from './use-market-feed'

export function useUniqueUsersTrades(marketFeedData: AxiosResponse<MarketFeedData[]> | undefined) {
  return useMemo(() => {
    if (marketFeedData?.data.length) {
      const uniqueUsers = new Map()

      for (const event of marketFeedData.data) {
        const userAccount = event.user?.account || event.profile?.account
        if (userAccount && !uniqueUsers.has(userAccount)) {
          uniqueUsers.set(userAccount, event)
        }
        if (uniqueUsers.size >= 3) break
      }

      return Array.from(uniqueUsers.values())
    }
    return null
  }, [marketFeedData])
}
