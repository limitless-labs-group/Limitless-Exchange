import { Address, getAddress, toHex } from 'viem'
import { limitlessApi, useEtherspot } from '@/services'
import { useSignMessage } from 'wagmi'
import { useMutation } from '@tanstack/react-query'
import { Profile, ProfileActionType } from '@/types/profiles'
import { useToast } from '@/hooks'
import { Toast } from '@/components/common/toast'
import { getSigningMessage } from '@/hooks/profiles/queries'

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

  return useMutation({
    mutationKey: ['create-profile'],
    mutationFn: async ({
      displayName: _displayName,
      username: _username,
      bio: _bio,
      client,
      account,
    }: IUseCreateProfile): Promise<Profile> => {
      debugger
      console.log(decodeURI('Register%20profile'))
      console.log(ProfileActionType.REGISTER_PROFILE)
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
          eoaWallet: client === 'eoa' ? account : smartWalletExternallyOwnedAccountAddress,
          smartWallet: client === 'eoa' ? '' : account,
          client,
        },
        {
          headers,
        }
      )
      console.log(res)
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
