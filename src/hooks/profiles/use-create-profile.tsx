import { useProfileAuthSigningMessage } from '@/hooks/profiles'
import { useAccount, useSignMessage } from 'wagmi'
import { getAddress, toHex } from 'viem'
import { limitlessApi } from '@/services'
import { useMutation } from '@tanstack/react-query'
import { Profile } from '@/types/profiles'
import { useToast } from '@/hooks'
import { Toast } from '@/components/common/toast'

export interface IUseCreateProfile {
  displayName: string
  username: string
  bio: string
}

export const useCreateProfile = () => {
  const toast = useToast()

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
    }: IUseCreateProfile): Promise<Profile> => {
      const { data: registerProfileSigningMessage } = await getRegisterProfileSigningMessage()
      if (!registerProfileSigningMessage) throw new Error('Failed to get signing message')
      const signature = await signMessageAsync({ message: registerProfileSigningMessage, account })
      const headers = {
        'x-account': getAddress(account!),
        'x-signature': signature,
        'x-signing-message': toHex(String(registerProfileSigningMessage)),
      }

      const res = await limitlessApi.post(
        '/profiles',
        { displayName: _displayName, username: _username, bio: _bio },
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
