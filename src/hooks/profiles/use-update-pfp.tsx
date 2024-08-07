import { useProfileAuthSigningMessage } from '@/hooks/profiles'
import { useAccount, useSignMessage } from 'wagmi'
import { getAddress, toHex } from 'viem'
import { limitlessApi } from '@/services'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { Profile } from '@/types/profiles'
import { Toast } from '@/components/common/toast'

export const useUpdatePfp = () => {
  const toast = useToast()

  const { address: account } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { refetch: getUpdatePfpSigningMessage } = useProfileAuthSigningMessage({
    purpose: 'UPDATE_PFP',
  })

  return useMutation({
    mutationKey: ['update-pfp', { account }],
    mutationFn: async (pfpFile: File): Promise<Profile> => {
      const formData = new FormData()
      const { data: updatePfpSigningMessage } = await getUpdatePfpSigningMessage()
      if (!updatePfpSigningMessage) throw new Error('Failed to get signing message')
      const signature = await signMessageAsync({ message: updatePfpSigningMessage, account })
      const headers = {
        'content-type': 'multipart/form-data',
        'x-account': getAddress(account!),
        'x-signature': signature,
        'x-signing-message': toHex(String(updatePfpSigningMessage)),
      }
      formData.set('pfpFile', pfpFile)

      const res = await limitlessApi.put('/profiles/pfp', formData, {
        headers,
      })
      return res.data as Profile
    },
    onSuccess: () => {
      const id = toast({
        render: () => <Toast id={id} title='Profile picture updated successfully' />,
      })
    },
    onError: () => {
      const id = toast({ render: () => <Toast id={id} title='Failed to update profile picture' /> })
    },
  })
}
