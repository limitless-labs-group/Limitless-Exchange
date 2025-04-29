import { Address } from 'viem'

export interface Profile {
  id: number
  account: Address
  displayName: string
  username: string
  bio: string | undefined
  pfpUrl: string | undefined
  client: string | null
  smartWallet: string | null
  isCreator: boolean
  isAdmin: boolean
  socialUrl?: string | null
  referralCode: string
  referralData: Referee[]
}

export interface Referee {
  createdAt: string
  id: number
  referredProfileId: number
}

export interface ReferralData {
  referralData: Referee[]
  refereeCount: number
}

export enum ProfileActionType {
  REGISTER_PROFILE = 'REGISTER_PROFILE',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  LEAVE_COMMENT = 'LEAVE_COMMENT',
}
