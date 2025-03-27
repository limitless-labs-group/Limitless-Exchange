import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { limitlessApi } from '@/services'
import { DraftMarketType } from '@/types/draft'

export default function useMarketRewardsIncentive(slug?: string, tradeType?: DraftMarketType) {
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
