import { useProfileAuthSigningMessage } from '@/hooks/profiles'
import { Address, getAddress, toHex } from 'viem'
import { limitlessApi, useEtherspot } from '@/services'
import { useSignMessage } from 'wagmi'
import { useMutation } from '@tanstack/react-query'
import { Profile } from '@/types/profiles'
import { useToast } from '@/hooks'
import { Toast } from '@/components/common/toast'

export interface IUseCreateProfileMutation {
  displayName: string
  username: string
  bio: string
}
export interface IUseCreateProfile {
  account: Address | undefined
  client: 'etherspot' | 'eoa'
}

export const useCreateProfile = ({ account, client }: IUseCreateProfile) => {
  const toast = useToast()

  const { signMessage, smartWalletExternallyOwnedAccountAddress } = useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const { refetch: getRegisterProfileSigningMessage } = useProfileAuthSigningMessage({
    purpose: 'REGISTER_PROFILE',
  })

  return useMutation({
    mutationKey: ['create-profile', { account, client }],
    mutationFn: async ({
      displayName: _displayName,
      username: _username,
      bio: _bio,
    }: IUseCreateProfileMutation): Promise<Profile> => {
      const { data: registerProfileSigningMessage } = await getRegisterProfileSigningMessage()
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
          eoaWallet: client === 'eoa' ? account : smartWalletExternallyOwnedAccountAddress,
          smartWallet: client === 'eoa' ? '' : account,
          client,
        },
        {
          headers,
        }
      )
      return res.data as Profile
    },
    onSuccess: () => {
      const id = toast({ render: () => <Toast id={id} title='Profile registered successfully' /> })
    },
    onError: () => {
      const id = toast({ render: () => <Toast id={id} title='Failed to register profile' /> })
    },
  })
}
