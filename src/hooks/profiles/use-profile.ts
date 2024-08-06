import { limitlessApi, useAccount } from '@/services'
import { getAddress } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { Profile } from '@/types/profiles'

export const useProfile = () => {
  const { account } = useAccount()
  return useQuery({
    queryKey: ['profiles-me'],
    queryFn: async (): Promise<Profile> => {
      const res = await limitlessApi.get(`/profiles/${getAddress(account!)}`)
      return <Profile>res.data
    },
  })
}
