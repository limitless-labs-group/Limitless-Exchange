'use client'

import { useEffect, createContext, PropsWithChildren, useContext, useCallback } from 'react'
import {
  init,
  track as amplitudeTrack,
  getDeviceId,
  getSessionId,
} from '@amplitude/analytics-browser'
import * as sessionReplay from '@amplitude/session-replay-browser'
import { useAccount } from '@/services'
import { Address, MarketGroup } from '@/types'
import {
  CUSTOM_LOGIN_PROVIDER_TYPE,
  LOGIN_PROVIDER_TYPE,
} from '@toruslabs/openlogin-utils/dist/types/interfaces'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''
const NODE_ENV = process.env.NODE_ENV ?? 'development'

interface IAmplitudeContext {
  trackSignUp: () => void
  trackChanged: <T extends ChangedEventMetadata>(event: ChangeEvent, customData?: T) => void
  trackClicked: <T extends ClickedEventMetadata>(event: ClickEvent, customData?: T) => void
  trackOpened: <T extends OpenedEventMetadata>(event: OpenEvent, customData?: T) => void
  trackSignIn: <T extends SignInEventMetadata>(event: SignInEvent, customData?: T) => void
}

const AmplitudeContext = createContext<IAmplitudeContext>({} as IAmplitudeContext)

export const useAmplitude = () => useContext(AmplitudeContext)

export const AmplitudeProvider = ({ children }: PropsWithChildren) => {
  const { account, userInfo } = useAccount()

  useEffect(() => {
    init(AMPLITUDE_API_KEY, undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: false,
        attribution: false,
        formInteractions: false,
      },
    }).promise.then(() => {
      return sessionReplay.init(AMPLITUDE_API_KEY, {
        deviceId: getDeviceId(),
        sessionId: getSessionId(),
        sampleRate: 1,
      }).promise
    })
  }, [])

  const trackEvent = useCallback(
    async (eventType: EventType, customData?: EventMetadata) => {
      if (NODE_ENV === 'development') {
        return
      }

      return amplitudeTrack({
        event_type: String(eventType),
        event_properties: {
          ...customData,
          ...sessionReplay.getSessionReplayProperties(),
        },
        user_properties: {
          account,
          ...userInfo,
        },
      }).promise
    },
    [account]
  )

  const trackSignUp = async () => {
    return trackEvent(AuthenticationEvent.SignUp)
  }

  const trackChanged = async <T extends ChangedEventMetadata>(
    event: ChangeEvent,
    customData?: T
  ) => {
    return trackEvent(event, customData)
  }

  const trackClicked = async <T extends ClickedEventMetadata>(
    event: ClickEvent,
    customData?: T
  ) => {
    return trackEvent(event, customData)
  }

  const trackOpened = async <T extends OpenedEventMetadata>(event: OpenEvent, customData?: T) => {
    return trackEvent(event, customData)
  }

  const trackSignIn = async <T extends SignInEventMetadata>(event: SignInEvent, customData?: T) => {
    return trackEvent(event, customData)
  }

  const contextProviderValue: IAmplitudeContext = {
    trackSignUp,
    trackChanged,
    trackClicked,
    trackOpened,
    trackSignIn: trackSignIn,
  }

  return (
    <AmplitudeContext.Provider value={contextProviderValue}>{children}</AmplitudeContext.Provider>
  )
}

export type EventType = ChangeEvent | ClickEvent | SignInEvent | OpenEvent | AuthenticationEvent

export enum ChangeEvent {
  StrategyChanged = 'Strategy Changed',
  OutcomeChanged = 'Outcome Changed',
  ProfilePictureUploadedChanged = 'Profile Picture Uploaded',
  ProfileSettingsChanged = 'Profile Settings Changed',
}

export enum ClickEvent {
  BuyClicked = 'Buy Position Chosen',
  SellClicked = 'Sell Position Chosen',
  SellTradeClicked = 'Sell Trade Clicked',
  SellApproveClicked = 'Sell Approve Clicked',
  CreateMarketClicked = 'Create Market Clicked',
  TopUpClicked = 'Top Up Clicked',
  ShareMenuClicked = 'Share Menu Clicked',
  ShareItemClicked = 'Share Item Clicked',
  ChangeMarketInGroupClicked = 'Change Market In Group Clicked',
  ProfileBurgerMenuClicked = 'Profile Burger Menu Clicked',
  SignOutClicked = 'Sign Out',
  TradeButtonClicked = 'Trade Button Clicked',
  ConfirmTransactionClicked = 'Confirm Transaction Clicked',
  ConfirmCapClicked = 'Confirm Cap Clicked',
  LogoClicked = 'Logo Clicked',
  BackClicked = 'Back Clicked',
  UIModeClicked = 'UI Mode Changed',
  CategoryClicked = 'Category Clicked',
  WalletClicked = 'Wallet Clicked',
  CopyAddressClicked = 'Wallet Address Copied',
  WithdrawClicked = 'Withdraw Clicked',
  WrapETHClicked = 'Wrap ETH Clicked',
  WithdrawConfirmedClicked = 'Withdraw Confirmed',
  SortClicked = 'Sort Clicked',
  StrokeClicked = 'Stroke Clicked',
  ClaimRewardOnPortfolioClicked = 'Claim Reward On Portfolio Clicked',
  ClaimRewardOnMarketPageClicked = 'Claim Reward On Market Page Clicked',
  SignW3AIn = 'Sign In W3A Option Chosen',
  ProfilePictureUploadClicked = 'Profile Picture Upload Clicked',
  LimitlessLinksClicked = 'Limitless Links Clicked',
  FeeTradingDetailsClicked = 'Fee Trading Details Clicked',
  ReturnTradingDetailsClicked = 'Return Trading Details Clicked',
  MarketPageOpened = 'Market Page Opened',
  MediumMarketBannerClicked = 'Medium Market Banner Clicked',
  QuickBetClicked = 'Quick Bet Clicked',
  NevermindButtonClicked = 'Nevermind Button Clicked',
}

export enum SignInEvent {
  SignIn = 'Sign In',
  SignInWithFarcaster = 'Login with Farcaster',
}

export enum OpenEvent {
  PageOpened = 'Page Opened',
  LoginWindowOpened = 'Login Window Opened',
  ProfileSettingsOpened = 'Profile Settings Opened',
}

export enum AuthenticationEvent {
  SignUp = 'Sign Up',
}

export interface AccountMetadata {
  email?: string
  web3WalletAddress?: Address
  smartWalletAddress?: Address
}

export type StrategyChangedType = 'Buy selected' | 'Sell selected'
export interface StrategyChangedMetadata {
  type: StrategyChangedType
  marketAddress: Address
}

export interface OutcomeChangedMetadata {
  choice: OutcomeChangedChoice
  marketAddress: Address
}

export type OutcomeChangedChoice = 'Yes' | 'No'
export type WalletType = 'eoa' | 'etherspot'
export interface TradeClickedMetadata {
  outcome: OutcomeChangedChoice
  walletType: WalletType
  marketAddress: Address
  marketType?: 'group' | 'single'
}

export interface ClickedApproveMetadata {
  address: Address
}

export interface ClickedWithdrawMetadata {
  coin: string
}

export type LogoClickedPage =
  | 'Explore Markets'
  | 'Portfolio'
  | 'Market Page'
  | 'Unknown Page'
  | 'Home'
  | 'Feed'
export interface LogoClickedMetadata {
  page: LogoClickedPage
}

export interface CreateMarketClickedMetadata {
  page: LogoClickedPage
}

export type DepositClickedPage =
  | 'Portfolio'
  | 'Portfolio - Top up Button'
  | 'Market Page'
  | 'Creator Cabinet'
  | 'Explore Markets'
  | 'Home'
export interface DepositClickedMetadata {
  page: DepositClickedPage
}

export type SupportChatClickedPage = 'Deposit Page' | 'Header Dropdown Menu' | 'Home'
export interface SupportChatClickedMetadata {
  page: SupportChatClickedPage
}

export type PricePresetClickedType = '+10 clicked' | '-10 clicked'
export interface PricePresetClickedMetadata {
  type: PricePresetClickedType
}

export type ShareClickedType = 'Copy Link' | 'X/Twitter' | 'Farcaster'
export interface ShareClickedMetadata {
  type: ShareClickedType
  address?: Address
  marketType: 'group' | 'single'
}

interface MarketChangeInGroupData {
  marketGroup: MarketGroup
}

interface FeeAndReturnTradingDetailsClicked {
  from: 'percentage' | 'numbers'
  to: 'percentage' | 'numbers'
  platform: 'desktop' | 'mobile'
  marketAddress: Address
}

export type ModalOpenedModal = 'Profile Settings'
export type PageOpenedPage =
  | 'Market Page'
  | 'Creator Cabinet'
  | 'Portfolio - History tab'
  | 'Portfolio Page'
  | 'Deposit Page'
  | 'Explore Markets'
  | 'Home'
export interface PageOpenedMetadata {
  page: PageOpenedPage
  marketAddress?: Address
  category?: string
  [key: string]: any
}

export type OpenMarketClickedPage =
  | 'Creator Cabinet'
  | 'Portfolio Page'
  | 'Explore Markets'
  | 'Home'
export type Platform = 'Mobile' | 'Desktop'
export interface ProfileSettingsMetadata {
  platform: Platform
}
export type ProfileSettingsOpenedMetadata = ProfileSettingsMetadata
export type ProfilePictureUploadClickedMetadata = ProfileSettingsMetadata
export type ProfilePictureUploadedChangedMetadata = ProfileSettingsMetadata
export type ProfileSettingsChangedMetadata = ProfileSettingsMetadata

export interface OpenMarketClickedMetadata {
  page: OpenMarketClickedPage
}

export type HeaderOptionClickedOption =
  | 'Invite Friends'
  | 'Profile Icon'
  | 'Explore Markets'
  | 'Invested Clicked'
  | 'Balance Clicked'
  | 'To Win Clicked'
  | 'Become a Creator Clicked'
export interface HeaderOptionClickedMetadata {
  option: HeaderOptionClickedOption
}

export type SignInWithFarcasterType =
  | 'Farcaster'
  | 'Google'
  | 'X/Twitter'
  | 'Discord'
  | 'Email/Phone'

export interface SignInWithFarcasterMetadata {
  type: SignInWithFarcasterType
}

export type WalletAddressCopiedPage = 'Deposit'
export interface WalletAddressCopiedMetadata {
  page: WalletAddressCopiedPage
}

export type ProfileBurgerMenuClickedOption =
  | 'Copy Wallet Address'
  | 'Wallet'
  | 'Portfolio'
  | 'Sign Out'
  | 'Home'
  | 'Markets'
export interface ProfileBurgerMenuClickedMetadata {
  option: ProfileBurgerMenuClickedOption
}

export interface SortMetadata {
  oldValue: string
  newValue: string
}

export interface StrokeMetadata {
  changeTo: 'run' | 'pause'
}

export interface TopUpMetadata {
  platform: string
}

export interface UIModeMetadata {
  mode: string
}

export interface SignInW3AClickedMetadata {
  option: LOGIN_PROVIDER_TYPE | CUSTOM_LOGIN_PROVIDER_TYPE | undefined
}

export interface MediumBannerClicked {
  bannerPosition: number
  bannerPaginationPage: number
}

export type ChangedEventMetadata =
  | StrategyChangedMetadata
  | OutcomeChangedMetadata
  | ProfilePictureUploadedChangedMetadata
  | ProfileSettingsChangedMetadata
export type ClickedEventMetadata =
  | SupportChatClickedMetadata
  | PricePresetClickedMetadata
  | ShareClickedMetadata
  | OpenMarketClickedMetadata
  | HeaderOptionClickedMetadata
  | CreateMarketClickedMetadata
  | ProfileBurgerMenuClickedMetadata
  | TradeClickedMetadata
  | DepositClickedMetadata
  | ClickedApproveMetadata
  | LogoClickedMetadata
  | ClickedWithdrawMetadata
  | SortMetadata
  | StrokeMetadata
  | TopUpMetadata
  | UIModeMetadata
  | SignInW3AClickedMetadata
  | MarketChangeInGroupData
  | FeeAndReturnTradingDetailsClicked
  | MediumBannerClicked

export type OpenedEventMetadata = PageOpenedMetadata | ProfileSettingsMetadata
export type SignInEventMetadata = SignInWithFarcasterMetadata
export type CopiedEventMetadata = WalletAddressCopiedMetadata

export type EventMetadata =
  | ChangedEventMetadata
  | ClickedEventMetadata
  | OpenedEventMetadata
  | SignInEventMetadata
  | CopiedEventMetadata
