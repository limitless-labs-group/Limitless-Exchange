import { useQuery } from '@tanstack/react-query'
import { useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export interface LockedBalanceResponse {
  collateral: {
    balance: number
    symbol: string
    decimals: number
  }
  yes: number
  no: number
}

export default function useMarketLockedBalance(slug?: string) {
  const axiosPrivateClient = useAxiosPrivateClient()
  const { web3Wallet } = useAccount()
  return useQuery({
    queryKey: ['locked-balance', slug],
    queryFn: async () => {
      const response = await axiosPrivateClient.get<LockedBalanceResponse>(
        `/markets/${slug}/locked-balance`
      )
      return response.data
    },
    // Todo change it to other property after it's merged with privy
    enabled: !!web3Wallet && !!slug,
  })
}
