import { Address } from 'viem'

export interface Profile {
  id: number
  account: Address
  displayName: string
  username: string
  bio: string | undefined
  pfpUrl: string | undefined
}

export enum ProfileActionType {
  REGISTER_PROFILE = 'Register profile',
  UPDATE_PROFILE = 'Update profile',
}
