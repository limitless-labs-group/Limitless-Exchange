import { useProfileAuthSigningMessage } from '@/hooks/profiles'
import { limitlessApi } from '@/services'
import { useMutation } from '@tanstack/react-query'
import { getAddress } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

export interface IUseCreateProfile {
  displayName: string
  username: string
  bio: string
}

export const useCreateProfile = () => {
  const { address: account } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { refetch: getRegisterProfileSigningMessage } = useProfileAuthSigningMessage({
    purpose: 'REGISTER_PROFILE',
  })

  return useMutation({
    mutationKey: ['create-profile', { account }],
    mutationFn: async ({
      displayName: _displayName,
      username: _username,
      bio: _bio,
    }: IUseCreateProfile) => {
      const { data: registerProfileSigningMessage } = await getRegisterProfileSigningMessage()
      if (!registerProfileSigningMessage) throw new Error('Failed to get signing message')
      const signature = await signMessageAsync({ message: registerProfileSigningMessage })

      await limitlessApi.post(
        '/profiles',
        { displayName: _displayName, username: _username, bio: _bio },
        {
          headers: {
            'x-account': getAddress(account!),
            'x-signature': signature,
            'x-signing-message': String(registerProfileSigningMessage),
          },
        }
      )
    },
  })
}
