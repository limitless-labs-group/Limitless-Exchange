import { limitlessApi } from '@/services'
import { Address, getAddress } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { Profile } from '@/types/profiles'

export interface IUseProfile {
  account: Address | undefined
}
export const useProfile = ({ account }: IUseProfile) => {
  return useQuery({
    queryKey: ['profiles', { account }],
    queryFn: async (): Promise<Profile> => {
      const res = await limitlessApi.get(`/profiles/${getAddress(account!)}`)
      return <Profile>res.data
    },
    enabled: !!account,
  })
}
