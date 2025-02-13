import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { limitlessApi } from '@/services'

export default function useMarketRewardsIncentive(slug?: string, tradeType?: 'clob' | 'amm') {
  return useQuery({
    queryKey: ['market-rewards-incentive', slug],
    queryFn: async () => {
      const response: AxiosResponse<{ totalRewards: number }> = await limitlessApi.get(
        `reward-distribution/total-rewards/${slug}`
      )
      return response.data
    },
    enabled: !!slug && tradeType === 'clob',
  })
}
