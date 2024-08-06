import { useProfileAuthSigningMessage } from '@/hooks/profiles'
import { useAccount, useSignMessage } from 'wagmi'
import { getAddress, toHex } from 'viem'
import { limitlessApi } from '@/services'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { Profile } from '@/types/profiles'
import { Toast } from '@/components/common/toast'

export interface IUseUpdateProfile {
  displayName: string
  username: string
  bio: string
}

export const useUpdateProfile = () => {
  const toast = useToast()

  const { address: account } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { refetch: getUpdateProfileSigningMessage } = useProfileAuthSigningMessage({
    purpose: 'UPDATE_PROFILE',
  })

  return useMutation({
    mutationKey: ['update-profile', { account }],
    mutationFn: async ({
      displayName: _displayName,
      username: _username,
      bio: _bio,
    }: IUseUpdateProfile) => {
      const { data: updateProfileSigningMessage } = await getUpdateProfileSigningMessage()
      if (!updateProfileSigningMessage) throw new Error('Failed to get signing message')
      const signature = await signMessageAsync({ message: updateProfileSigningMessage })
      const headers = {
        'x-account': getAddress(account!),
        'x-signature': signature,
        'x-signing-message': toHex(String(updateProfileSigningMessage)),
      }

      const res = await limitlessApi.put(
        '/profiles',
        { displayName: _displayName, username: _username, bio: _bio },
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
