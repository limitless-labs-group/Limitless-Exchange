import { useProfileAuthSigningMessage } from '@/hooks/profiles'
import { limitlessApi } from '@/services'
import { useMutation } from '@tanstack/react-query'
import { getAddress } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

export interface IUseUpdateProfile {
  displayName: string
  username: string
  bio: string
}

export const useUpdateProfile = () => {
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

      await limitlessApi.put(
        '/profiles',
        { displayName: _displayName, username: _username, bio: _bio },
        {
          headers: {
            ['x-account']: getAddress(account!),
            ['x-signature']: signature,
            ['x-signing-message']: updateProfileSigningMessage,
          },
        }
      )
    },
  })
}
