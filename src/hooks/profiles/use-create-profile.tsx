import { useMutation } from '@tanstack/react-query'
import { Address, getAddress, toHex } from 'viem'
import { useSignMessage } from 'wagmi'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { limitlessApi, useEtherspot, useLimitlessApi } from '@/services'
import { Profile, ProfileActionType } from '@/types/profiles'

export interface IUseCreateProfile {
  account: Address | undefined
  client: 'etherspot' | 'eoa'
  displayName: string
  username: string
  bio: string
}

export const useCreateProfile = () => {
  const toast = useToast()

  const { signMessage, smartWalletExternallyOwnedAccountAddress } = useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const { getSigningMessage } = useLimitlessApi()

  return useMutation({
    mutationKey: ['create-profile'],
    mutationFn: async ({
      displayName: _displayName,
      username: _username,
      bio: _bio,
      client,
      account,
    }: IUseCreateProfile): Promise<Profile> => {
      const { data: registerProfileSigningMessage } = await getSigningMessage(
        ProfileActionType.REGISTER_PROFILE
      )
      if (!registerProfileSigningMessage) throw new Error('Failed to get signing message')
      const signature = (
        client === 'eoa'
          ? await signMessageAsync({ message: registerProfileSigningMessage, account })
          : await signMessage(registerProfileSigningMessage)
      ) as `0x${string}`

      const headers = {
        'x-account':
          client === 'eoa'
            ? getAddress(account!)
            : getAddress(smartWalletExternallyOwnedAccountAddress!),
        'x-signature': signature,
        'x-signing-message': toHex(String(registerProfileSigningMessage)),
      }

      const res = await limitlessApi.post(
        '/profiles',
        {
          displayName: _displayName,
          username: _username,
          bio: _bio,
          smartWallet: client === 'eoa' ? null : account,
          client,
        },
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
