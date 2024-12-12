import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { UserCreatedMarket } from '@/types'

export default function useUserCreatedMarkets() {
  const privateClient = useAxiosPrivateClient()
  const address = useWalletAddress()
  return useQuery({
    queryKey: ['my-markets', address],
    queryFn: async () => {
      const result: AxiosResponse<UserCreatedMarket[]> = await privateClient.get(
        `/profiles/my-markets`
      )
      return result.data
    },
    enabled: !!address,
  })
}
