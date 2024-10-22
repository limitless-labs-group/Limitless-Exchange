import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import { limitlessApi } from '@/services'
import { Token } from '@/types'

export const useToken = (contractAddress?: Address) => {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ['token', contractAddress],
    queryFn: async () => {
      const dataExists = queryClient.getQueryData(['token', contractAddress])
      if (!!dataExists) {
        return dataExists as Token
      }
      const response = await limitlessApi.get(`/tokens/${contractAddress}`)
      return response.data as Token
    },
    enabled: !!contractAddress,
  })
}
