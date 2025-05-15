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
  isOnboarded: boolean
  referralCode: string
  referralData: Referee[]
  enrolledInPointsProgram: boolean
  rank: {
    id: number
    feeRateBps: number
    name: RankType
  }
}

export enum RankType {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond',
}

export interface Referee {
  createdAt: string
  id: number
  referredProfileId: number
  displayName: string
  pfpUrl: string | null
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

export interface ReferralsTradingVolumeResponse {
  referrer_profile_id: number
  referees_trading_usd: number | null
  referees_trading_contracts: number | null
}
