import { useMutation } from '@tanstack/react-query'
import { Address } from 'viem'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { useEtherspot } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
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
  const privateAxios = useAxiosPrivateClient()
  return useMutation({
    mutationKey: ['update-profile'],
    mutationFn: async ({
      displayName: _displayName,
      username: _username,
      bio: _bio,
      account,
      client,
    }: IUseUpdateProfileMutation) => {
      const res = await privateAxios.put('/profiles', {
        displayName: _displayName,
        username: _username,
        bio: _bio,
        eoaWallet: client === 'eoa' ? account : smartWalletExternallyOwnedAccountAddress,
        smartWallet: client === 'eoa' ? '' : account,
        client,
      })
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
