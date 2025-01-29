import { useQuery } from '@tanstack/react-query'
import { useWalletClient } from 'wagmi'
import { IUseLogin, useLogin } from './use-login'
import useClient from '@/hooks/use-client'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export const useUserSession = ({ client, account, smartWallet }: IUseLogin) => {
  const { mutateAsync: loginUser } = useLogin()
  const axiosPrivate = useAxiosPrivateClient()
  const { isLogged } = useClient()
  const { data: walletClient } = useWalletClient()

  console.log(walletClient)

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
    enabled: !!isLogged && !!walletClient,
  })
}
