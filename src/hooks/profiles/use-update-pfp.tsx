import { useProfileAuthSigningMessage } from '@/hooks/profiles'
import { Address, getAddress, toHex } from 'viem'
import { limitlessApi, useEtherspot } from '@/services'
import { useSignMessage } from 'wagmi'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { Profile } from '@/types/profiles'
import { Toast } from '@/components/common/toast'

export interface IUseUpdatePfp {
  account: Address | undefined
  client: 'etherspot' | 'eoa'
}

export const useUpdatePfp = ({ account, client }: IUseUpdatePfp) => {
  const toast = useToast()

  const { signMessage, smartWalletExternallyOwnedAccountAddress } = useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const { refetch: getUpdatePfpSigningMessage } = useProfileAuthSigningMessage({
    purpose: 'UPDATE_PFP',
  })

  return useMutation({
    mutationKey: ['update-pfp', { account, client }],
    mutationFn: async (pfpFile: File): Promise<Profile> => {
      const formData = new FormData()
      const { data: updatePfpSigningMessage } = await getUpdatePfpSigningMessage()
      if (!updatePfpSigningMessage) throw new Error('Failed to get signing message')
      const signature =
        client === 'eoa'
          ? await signMessageAsync({ message: updatePfpSigningMessage, account })
          : await signMessage(updatePfpSigningMessage)
      const headers = {
        'content-type': 'multipart/form-data',
        'x-account':
          client === 'eoa'
            ? getAddress(account!)
            : getAddress(smartWalletExternallyOwnedAccountAddress!),
        'x-signature': signature,
        'x-signing-message': toHex(String(updatePfpSigningMessage)),
      }
      formData.set('pfpFile', pfpFile)
      formData.set(
        'eoaWallet',
        String(client === 'eoa' ? account : smartWalletExternallyOwnedAccountAddress)
      )
      formData.set('smartWallet', String(client === 'eoa' ? '' : account))
      formData.set('client', client)

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
