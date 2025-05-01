import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { ReferralsTradingVolumeResponse } from '@/types/profiles'

export function useReferralsTotalVolume() {
  const privateClient = useAxiosPrivateClient()
  const { web3Client } = useAccount()
  return useQuery({
    queryKey: ['referrals-trading-volume'],
    queryFn: async () => {
      const response: AxiosResponse<ReferralsTradingVolumeResponse> = await privateClient.get(
        '/referral/volume-traded'
      )
      return response.data
    },
    enabled: !!web3Client,
  })
}
