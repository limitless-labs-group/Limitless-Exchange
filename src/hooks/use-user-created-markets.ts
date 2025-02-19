import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { UserCreatedMarket } from '@/types'

export default function useUserCreatedMarkets() {
  const privateClient = useAxiosPrivateClient()
  const { web3Wallet } = useAccount()
  return useQuery({
    queryKey: ['my-markets', web3Wallet?.account?.address],
    queryFn: async () => {
      const result: AxiosResponse<UserCreatedMarket[]> = await privateClient.get(
        `/profiles/my-markets`
      )
      return result.data
    },
    enabled: !!web3Wallet,
  })
}
