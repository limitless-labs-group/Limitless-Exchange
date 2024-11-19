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
  REGISTER_PROFILE = 'REGISTER_PROFILE',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  LEAVE_COMMENT = 'LEAVE_COMMENT',
}
