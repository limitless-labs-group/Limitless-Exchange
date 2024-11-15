import { useMutation } from '@tanstack/react-query'
import { Address, getAddress, toHex } from 'viem'
import { useSignMessage } from 'wagmi'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { useEtherspot } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { Profile } from '@/types/profiles'

export interface IUseLogin {
  account: Address | undefined
  client: 'etherspot' | 'eoa'
}

export const useLogin = () => {
  const toast = useToast()

  const { signMessage, smartWalletExternallyOwnedAccountAddress } = useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const axiosInstance = useAxiosPrivateClient()

  const getSigningMsg = async () => {
    return axiosInstance.get(`/auth/signing-message`)
  }

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ client, account }: IUseLogin): Promise<Profile> => {
      const { data: loginSigningMessage } = await getSigningMsg()

      if (!loginSigningMessage) throw new Error('Failed to get signing message')
      const signature = (
        client === 'eoa'
          ? await signMessageAsync({ message: loginSigningMessage, account })
          : await signMessage(loginSigningMessage)
      ) as `0x${string}`

      const headers = {
        'x-account': getAddress(
          client === 'eoa' ? account! : smartWalletExternallyOwnedAccountAddress!
        ),
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
      return res.data as Profile
    },
    onSuccess: () => {
      // const id = toast({ render: () => <Toast id={id} title='Profile registered successfully' /> })
    },
    onError: () => {
      const id = toast({ render: () => <Toast id={id} title='Failed to register profile' /> })
    },
  })
}
