import { limitlessApi } from '@/services'
import { ProfileActionType } from '@/types/profiles'

export const getSigningMessage = async (purpose: ProfileActionType) => {
  return limitlessApi.get(`/profiles/signing-message/${purpose}`)
}
