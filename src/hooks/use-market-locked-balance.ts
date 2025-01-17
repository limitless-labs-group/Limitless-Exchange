import { useQuery } from '@tanstack/react-query'
import { useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export default function useMarketLockedBalance(slug?: string) {
  const axiosPrivateClient = useAxiosPrivateClient()
  const { account } = useAccount()
  return useQuery({
    queryKey: ['locked-balance', slug],
    queryFn: async () => {
      const response = await axiosPrivateClient.get(`/markets/${slug}/locked-balance`)
      return response.data
    },
    // Todo change it to other property after it's merged with privy
    enabled: !!account && !!slug,
  })
}
