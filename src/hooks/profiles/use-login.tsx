import { usePrivy } from '@privy-io/react-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { Address, getAddress, toHex } from 'viem'
import { useSignMessage } from 'wagmi'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import useRefetchAfterLogin from '@/hooks/use-refetch-after-login'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { Profile } from '@/types/profiles'

export interface IUseLogin {
  account?: Address
  client: 'etherspot' | 'eoa'
}

export const useLogin = () => {
  const toast = useToast()
  const { signMessage } = usePrivy()
  const { refetchAll } = useRefetchAfterLogin()
  const { signMessageAsync } = useSignMessage()
  const axiosInstance = useAxiosPrivateClient()
  const queryClient = useQueryClient()

  const getSigningMsg = async () => {
    return axiosInstance.get(`/auth/signing-message`)
  }

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ client, account }: IUseLogin): Promise<Profile> => {
      const { data: loginSigningMessage } = await getSigningMsg()

      if (!loginSigningMessage) throw new Error('Failed to get signing message')
      const signature =
        client === 'eoa'
          ? await signMessageAsync({ message: loginSigningMessage })
          : await signMessage(loginSigningMessage, {}, account)

      const headers = {
        'x-account': getAddress(account as Address),
        'x-signature': signature,
        'x-signing-message': toHex(String(loginSigningMessage)),
      }

      const res = await axiosInstance.post(
        '/auth/login',
        { client },
        {
          headers,
        }
      )
      Cookies.set('logged-in-to-limitless', 'true')
      return res.data as Profile
    },
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(['profiles', { account: variables.account }], updatedData)
      refetchAll()
    },
    onError: () => {
      const id = toast({ render: () => <Toast id={id} title='Failed to register profile' /> })
    },
  })
}
