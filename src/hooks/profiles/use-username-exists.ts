import { limitlessApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export interface IUseUsernameExists {
  username: string
}

export const useUsernameExists = ({ username }: IUseUsernameExists) =>
  useQuery({
    queryKey: ['username-exists', { username }],
    queryFn: async () => {
      const res = await limitlessApi.get(`/profiles/${username}/exists`)
      return res.data as boolean
    },
    enabled: false,
  })
