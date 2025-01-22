import { AxiosResponse } from 'axios'
import { useMemo } from 'react'
import { MarketFeedData } from './use-market-feed'

export function useUniqueUsersTrades(marketFeedData: AxiosResponse<MarketFeedData[]> | undefined) {
  return useMemo(() => {
    if (marketFeedData?.data.length) {
      const uniqueUsers = new Map()

      for (const event of marketFeedData.data) {
        if (!uniqueUsers.has(event.user?.account)) {
          uniqueUsers.set(event.user?.account, event)
        }
        if (uniqueUsers.size >= 3) break
      }

      return Array.from(uniqueUsers.values())
    }
    return null
  }, [marketFeedData])
}
