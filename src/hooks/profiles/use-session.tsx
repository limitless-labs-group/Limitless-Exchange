import { useQuery } from '@tanstack/react-query'
import { IUseLogin, useLogin } from './use-login'
import { useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export const useUserSession = ({ client, account, smartWallet }: IUseLogin) => {
  const { mutateAsync: loginUser } = useLogin()
  const axiosPrivate = useAxiosPrivateClient()
  const { isLogged } = useAccount()

  return useQuery({
    queryKey: ['user-session'],
    queryFn: async () => {
      if (client === 'etherspot' && !smartWallet) {
        return
      }
      try {
        await axiosPrivate.get('/auth/verify-auth')
        // await refetchWalletClient()
      } catch (e) {
        // @ts-ignore
        if (e.status === 401) {
          await loginUser({ client, account, smartWallet })
        }
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: isLogged,
  })
}
