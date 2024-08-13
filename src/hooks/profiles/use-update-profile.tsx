import { useProfileAuthSigningMessage } from '@/hooks/profiles'
import { Address, getAddress, toHex } from 'viem'
import { limitlessApi, useEtherspot } from '@/services'
import { useSignMessage } from 'wagmi'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { Profile } from '@/types/profiles'
import { Toast } from '@/components/common/toast'

export interface IUseUpdateProfileMutation {
  displayName: string
  username: string
  bio: string
}
export interface IUseUpdateProfile {
  account: Address | undefined
  client: 'etherspot' | 'eoa'
}

export const useUpdateProfile = ({ account, client }: IUseUpdateProfile) => {
  const toast = useToast()

  const { signMessage, smartWalletExternallyOwnedAccountAddress } = useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const { refetch: getUpdateProfileSigningMessage } = useProfileAuthSigningMessage({
    purpose: 'UPDATE_PROFILE',
  })

  return useMutation({
    mutationKey: ['update-profile', { account, client }],
    mutationFn: async ({
      displayName: _displayName,
      username: _username,
      bio: _bio,
    }: IUseUpdateProfileMutation) => {
      const { data: updateProfileSigningMessage } = await getUpdateProfileSigningMessage()
      if (!updateProfileSigningMessage) throw new Error('Failed to get signing message')
      const signature = (
        client === 'eoa'
          ? await signMessageAsync({ message: updateProfileSigningMessage })
          : await signMessage(updateProfileSigningMessage)
      ) as `0x${string}`
      const headers = {
        'x-account':
          client === 'eoa'
            ? getAddress(account!)
            : getAddress(smartWalletExternallyOwnedAccountAddress!),
        'x-signature': signature,
        'x-signing-message': toHex(String(updateProfileSigningMessage)),
      }

      const res = await limitlessApi.put(
        '/profiles',
        {
          displayName: _displayName,
          username: _username,
          bio: _bio,
          eoaWallet: client === 'eoa' ? account : smartWalletExternallyOwnedAccountAddress,
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
      const id = toast({ render: () => <Toast id={id} title='Profile updated successfully' /> })
    },
    onError: () => {
      const id = toast({ render: () => <Toast id={id} title='Failed to update profile' /> })
    },
  })
}
