import { useQuery } from '@tanstack/react-query'
import { IUseLogin, useLogin } from './use-login'
import { useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

const useCheckSession = () => {
  const axiosPrivate = useAxiosPrivateClient()
  return async () => {
    const response = await axiosPrivate.get('/auth/verify-auth')
    return response.status
  }
}

export const useUserSession = ({ client, account, smartWallet }: IUseLogin) => {
  // const checkSession = useCheckSession()
  const { mutateAsync: loginUser } = useLogin()
  const axiosPrivate = useAxiosPrivateClient()
  const { interfaceLoading } = useAccount()

  return useQuery({
    queryKey: ['user-session'],
    queryFn: async () => {
      debugger
      console.log(interfaceLoading)
      if (client === 'etherspot' && !smartWallet) {
        return
      }
      await axiosPrivate.get('/auth/verify-auth')
      // const status = await checkSession()
      // if (status === 401) {
      //   return loginUser({ client, account, smartWallet })
      // }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: false,
  })
}
