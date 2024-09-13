import { Address, getAddress, toHex } from 'viem'
import { limitlessApi, useEtherspot } from '@/services'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { Profile } from '@/types/profiles'
import { Toast } from '@/components/common/toast'

export interface IUseUpdatePfp {
  account: Address | undefined
  client: 'etherspot' | 'eoa'
  pfpFile: File
  signature: string
  updateProfileMessage: string
}

export const useUpdatePfp = () => {
  const toast = useToast()
  const { smartWalletExternallyOwnedAccountAddress } = useEtherspot()

  return useMutation({
    mutationKey: ['update-pfp'],
    mutationFn: async ({
      account,
      client,
      pfpFile,
      signature,
      updateProfileMessage,
    }: IUseUpdatePfp): Promise<Profile> => {
      const formData = new FormData()

      if (!updateProfileMessage) throw new Error('Failed to get signing message')
      const headers = {
        'content-type': 'multipart/form-data',
        'x-account':
          client === 'eoa'
            ? getAddress(account!)
            : getAddress(smartWalletExternallyOwnedAccountAddress!),
        'x-signature': signature,
        'x-signing-message': toHex(String(updateProfileMessage)),
      }
      formData.set('pfpFile', pfpFile)
      formData.set('account', String(account))

      const res = await limitlessApi.put('/profiles/pfp', formData, {
        headers,
      })
      return res.data as Profile
    },
    onSuccess: () => {
      // const id = toast({
      //   render: () => <Toast id={id} title='Profile picture updated successfully' />,
      // })
    },
    onError: () => {
      const id = toast({ render: () => <Toast id={id} title='Failed to update profile picture' /> })
    },
  })
}
