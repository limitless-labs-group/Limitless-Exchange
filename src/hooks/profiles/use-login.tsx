import { usePrivy } from '@privy-io/react-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getWalletClient } from '@wagmi/core'
import Cookies from 'js-cookie'
import { Address, getAddress, toHex } from 'viem'
import useRefetchAfterLogin from '@/hooks/use-refetch-after-login'
import { configureChainsConfig } from '@/providers/Privy'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { Profile } from '@/types/profiles'

export interface IUseLogin {
  account?: Address
  client: 'etherspot' | 'eoa'
  smartWallet?: string
}

export const useLogin = () => {
  const { signMessage, user } = usePrivy()
  const { refetchAll } = useRefetchAfterLogin()
  const axiosInstance = useAxiosPrivateClient()
  const queryClient = useQueryClient()

  const getSigningMsg = async () => {
    return axiosInstance.get(`/auth/signing-message`)
  }

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ client, account, smartWallet }: IUseLogin): Promise<Profile> => {
      const { data: loginSigningMessage } = await getSigningMsg()

      if (!loginSigningMessage) throw new Error('Failed to get signing message')
      let signature = ''
      if (client === 'eoa') {
        const client = await getWalletClient(configureChainsConfig, {
          account: user?.wallet?.address as Address,
        })
        signature = await client.signMessage({ message: loginSigningMessage })
      } else {
        const { signature: smartWalletSignature } = await signMessage({
          message: loginSigningMessage,
        })
        signature = smartWalletSignature
      }

      const headers = {
        'x-account': getAddress(account as Address),
        'x-signature': signature,
        'x-signing-message': toHex(String(loginSigningMessage)),
      }

      const res = await axiosInstance.post(
        '/auth/login',
        { client, smartWallet },
        {
          headers,
        }
      )
      Cookies.set('logged-in-to-limitless', 'true')
      await refetchAll()
      return res.data as Profile
    },
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(['profiles', { account: variables.account }], updatedData)
    },
    // onError: () => {
    //   const id = toast({ render: () => <Toast id={id} title='Failed to register profile' /> })
    // },
  })
}
