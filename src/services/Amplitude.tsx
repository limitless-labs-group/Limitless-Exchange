'use client'

import { useEffect, createContext, PropsWithChildren, useContext, useCallback } from 'react'
import { init, track as amplitudeTrack } from '@amplitude/analytics-browser'
import { useAccount } from '@/services'
import { Address } from '@/types'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''
const NODE_ENV = process.env.NODE_ENV ?? 'development'

interface IAmplitudeContext {
  trackSignUp: () => void
  trackChanged: <T extends ChangedEventMetadata>(event: ChangeEvent, customData?: T) => void
  trackClicked: <T extends ClickedEventMetadata>(event: ClickEvent, customData?: T) => void
  trackOpened: <T extends OpenedEventMetadata>(event: OpenEvent, customData?: T) => void
  trackLogin: <T extends LoginEventMetadata>(event: LoginEvent, customData?: T) => void
  trackCopied: <T extends CopiedEventMetadata>(event: CopyEvent, customData?: T) => void
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

  const trackLogin = async <T extends LoginEventMetadata>(event: LoginEvent, customData?: T) => {
    return trackEvent(event, customData)
  }

  const trackCopied = async <T extends CopiedEventMetadata>(event: CopyEvent, customData?: T) => {
    return trackEvent(event, customData)
  }

  const contextProviderValue: IAmplitudeContext = {
    trackSignUp,
    trackChanged,
    trackClicked,
    trackOpened,
    trackLogin,
    trackCopied,
  }

  return (
    <AmplitudeContext.Provider value={contextProviderValue}>{children}</AmplitudeContext.Provider>
  )
}

export type EventType =
  | ChangeEvent
  | ClickEvent
  | LoginEvent
  | OpenEvent
  | CopyEvent
  | AuthenticationEvent

export enum ChangeEvent {
  StrategyChanged = 'Strategy Changed',
  OutcomeChanged = 'Outcome Changed',
}

export enum ClickEvent {
  CreateMarketClicked = 'Create Market Clicked',
  DepositClicked = 'Deposit Clicked',
  ExploreMarketsClicked = 'Explore Markets Clicked',
  SupportChatClicked = 'Support Chat Clicked',
  PricePresetClicked = 'Price Preset Clicked',
  ShareClicked = 'Share Clicked',
  OpenMarketClicked = 'Open Market Clicked',
  HeaderOptionClicked = 'Header Option Clicked',
  OpenCreatorProfileClicked = 'Open Creator Profile Clicked',
  ProfileBurgerMenuClicked = 'Profile Burger Menu Clicked',
  TradeClicked = 'Trade Clicked',
  ApproveClicked = 'Approve Clicked',
}

export enum LoginEvent {
  LoginWithFarcaster = 'Login with Farcaster',
}

export enum OpenEvent {
  PageOpened = 'Page Opened',
  LoginWindowOpened = 'Login Window Opened',
}

export enum CopyEvent {
  WalletAddressCopied = 'Wallet Address Copied',
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

export type OutcomeChangedChoice = 'Yes' | 'No'
export interface OutcomeChangedMetadata {
  choice: OutcomeChangedChoice
  marketAddress: Address
}

export type TradeClickedStrategy = 'Buy' | 'Sell'
export interface TradeClickedMetadata {
  strategy: TradeClickedStrategy
  marketAddress: Address
}

export interface ClickedApproveMetadata {
  address: Address
}

export type CreateMarketClickedPage = 'Explore Markets'
export interface CreateMarketClickedMetadata {
  page: CreateMarketClickedPage
}

export type DepositClickedPage =
  | 'Portfolio'
  | 'Portfolio - Top up Button'
  | 'Market Page'
  | 'Creator Cabinet'
  | 'Explore Markets'
export interface DepositClickedMetadata {
  page: DepositClickedPage
}

export type SupportChatClickedPage = 'Deposit Page' | 'Header Dropdown Menu'
export interface SupportChatClickedMetadata {
  page: SupportChatClickedPage
}

export type PricePresetClickedType = '+10 clicked' | '-10 clicked'
export interface PricePresetClickedMetadata {
  type: PricePresetClickedType
}

export type ShareClickedPage = 'Investor Page' | 'Creator Page' | 'Explore Markets' | 'Market Page'
export type ShareClickedType = 'Copy Link' | 'X/Twitter' | 'Farcaster'
export interface ShareClickedMetadata {
  type: ShareClickedType
  page: ShareClickedPage
}

export type PageOpenedPage =
  | 'Market Page'
  | 'Creator Cabinet'
  | 'Portfolio - History tab'
  | 'Portfolio Page'
  | 'Deposit Page'
  | 'Explore Markets'
export interface PageOpenedMetadata {
  page: PageOpenedPage
  marketAddress?: Address
  [key: string]: any
}

export type OpenMarketClickedPage = 'Creator Cabinet' | 'Portfolio Page' | 'Explore Markets'
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

export type LoginWithFarcasterType =
  | 'Farcaster'
  | 'Google'
  | 'X/Twitter'
  | 'Discord'
  | 'Email/Phone'
export interface LoginWithFarcasterMetadata {
  type: LoginWithFarcasterType
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
export interface ProfileBurgerMenuClickedMetadata {
  option: ProfileBurgerMenuClickedOption
}

export type ChangedEventMetadata = StrategyChangedMetadata | OutcomeChangedMetadata
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
export type OpenedEventMetadata = PageOpenedMetadata
export type LoginEventMetadata = LoginWithFarcasterMetadata
export type CopiedEventMetadata = WalletAddressCopiedMetadata

export type EventMetadata =
  | ChangedEventMetadata
  | ClickedEventMetadata
  | OpenedEventMetadata
  | LoginEventMetadata
  | CopiedEventMetadata
