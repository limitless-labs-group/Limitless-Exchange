import { useQuery } from '@tanstack/react-query'
import { IUseLogin, useLogin } from './use-login'
import useClient from '@/hooks/use-client'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export const useUserSession = ({ client, account, smartWallet, web3Wallet }: IUseLogin) => {
  const { mutateAsync: loginUser } = useLogin()
  const axiosPrivate = useAxiosPrivateClient()
  const { isLogged } = useClient()

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
          await loginUser({ client, account, smartWallet, web3Wallet })
        }
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!isLogged && !!account && (!!smartWallet || !!web3Wallet),
  })
}
