import { useQuery } from '@tanstack/react-query'
import { limitlessApi } from '@/services'

export interface IUseUsernameExists {
  username: string
}

export const useCheckUsername = ({ username }: IUseUsernameExists) =>
  useQuery({
    queryKey: ['username-exists', { username }],
    queryFn: async () => {
      const res = await limitlessApi.get(`/profiles/${username}/exists`)
      return res.data as boolean
    },
    enabled: false,
  })
