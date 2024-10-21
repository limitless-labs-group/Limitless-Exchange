import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { limitlessApi } from '@/services'

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
