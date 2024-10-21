import { useMutation } from '@tanstack/react-query'
import { Address, getAddress, toHex } from 'viem'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { limitlessApi, useEtherspot } from '@/services'
import { Profile } from '@/types/profiles'

export interface IUseUpdateProfileMutation {
  displayName: string
  username: string
  bio: string
  account: Address | undefined
  client: 'etherspot' | 'eoa'
  signature: string
  updateProfileMessage: string
}

export const useUpdateProfile = () => {
  const toast = useToast()
  const { smartWalletExternallyOwnedAccountAddress } = useEtherspot()

  return useMutation({
    mutationKey: ['update-profile'],
    mutationFn: async ({
      displayName: _displayName,
      username: _username,
      bio: _bio,
      account,
      client,
      signature,
      updateProfileMessage,
    }: IUseUpdateProfileMutation) => {
      const headers = {
        'x-account':
          client === 'eoa'
            ? getAddress(account!)
            : getAddress(smartWalletExternallyOwnedAccountAddress!),
        'x-signature': signature,
        'x-signing-message': toHex(String(updateProfileMessage)),
      }

      const res = await limitlessApi.put(
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
      // const id = toast({ render: () => <Toast id={id} title='Profile updated successfully' /> })
    },
    onError: () => {
      const id = toast({ render: () => <Toast id={id} title='Failed to update profile' /> })
    },
  })
}
