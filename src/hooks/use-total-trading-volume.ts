import { useQuery } from '@tanstack/react-query'
import { limitlessApi } from '@/services'
import { AxiosResponse } from 'axios'

export const useTotalTradingVolume = () => {
  return useQuery({
    queryKey: ['total-trading-volume'],
    queryFn: async () => {
      const response: AxiosResponse<{ totalVolume: number }> = await limitlessApi.get(
        `/widgets/total-volume`
      )
      return response.data.totalVolume
    },
  })
}
