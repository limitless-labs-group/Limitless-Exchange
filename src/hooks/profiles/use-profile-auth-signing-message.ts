import { limitlessApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export const PURPOSES = {
  REGISTER_PROFILE: 'Register profile',
  UPDATE_PFP: 'Update pfp',
  UPDATE_PROFILE: 'Update profile',
}

export interface IUseProfileAuthSigningMessage {
  purpose: keyof typeof PURPOSES
}

export const useProfileAuthSigningMessage = ({ purpose }: IUseProfileAuthSigningMessage) =>
  useQuery({
    queryKey: ['profile-auth-signing-message'],
    queryFn: async (): Promise<string> => {
      const res = await limitlessApi.get(`/profiles/signing-message/${purpose}`)
      const signingMessage = <string>res.data
      console.log('signingMessage', signingMessage)

      return signingMessage
    },
  })
