import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { ClobPosition } from '@/types/orders'

export function useMarketOrders(slug?: string) {
  const { web3Wallet } = useAccount()
  const privateClient = useAxiosPrivateClient()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return useQuery({
    queryKey: ['user-orders', slug],
    queryFn: async () => {
      const response: AxiosResponse<ClobPosition[]> = await privateClient.get(
        `/markets/${slug}/user-orders`
      )
      return response.data
    },
    enabled: !!slug && !!web3Wallet,
    refetchInterval: () => {
      const marketParam = searchParams.get('market')
      const isMarketPage = pathname === `/markets/${slug}`
      const isMarketParam = marketParam === slug

      return isMarketPage || isMarketParam ? 5000 : false
    },
  })
}
