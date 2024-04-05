'use client'

import { useEffect, createContext, PropsWithChildren, useContext } from 'react'
import { init, track as amplitudeTrack } from '@amplitude/analytics-browser'
import { useAccount } from '@/services'
import { Address } from '@/types'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''

interface IAmplitudeContext {
  trackSignUp: ({ email, web3WalletAddress, smartWalletAddress }: ITrackSignUp) => void
  trackChanged: <T extends ChangedEventMetadata>(event: ChangeEvent, customData?: T) => void
  trackClicked: <T extends ClickedEventMetadata>(event: ClickEvent, customData?: T) => void
  trackOpened: <T extends OpenedEventMetadata>(event: OpenEvent, customData?: T) => void
  trackLogin: <T extends LoginEventMetadata>(event: LoginEvent, customData?: T) => void
  trackCopied: <T extends CopiedEventMetadata>(event: CopyEvent, customData?: T) => void
}

const AmplitudeContext = createContext<IAmplitudeContext>({} as IAmplitudeContext)

export const useAmplitude = () => useContext(AmplitudeContext)

export const AmplitudeProvider = ({ children }: PropsWithChildren) => {
  const { accountMetadata: account } = useAccount()

  useEffect(() => {
    init(AMPLITUDE_API_KEY, undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: false,
      },
    })
  }, [])

  const trackSignUp = async ({ email, web3WalletAddress, smartWalletAddress }: ITrackSignUp) => {
    console.log('Amplitude.trackSignUp', { email, web3WalletAddress, smartWalletAddress })
    const result = await amplitudeTrack({
      event_type: 'Sign Up',
      event_properties: {
        email,
        web3WalletAddress,
        smartWalletAddress,
      },
    }).promise
    console.log('Amplitude.trackSignUp result', result)
  }

  const trackChanged = async <T extends ChangedEventMetadata>(
    event: ChangeEvent,
    customData?: T
  ) => {
    console.log('Amplitude.trackChanged', { event, customData })
    const result = await amplitudeTrack({
      event_type: String(event),
      event_properties: {
        ...customData,
      },
      user_properties: {
        ...account,
      },
    }).promise
    console.log('Amplitude.trackChanged result', result)
  }

  const trackClicked = async <T extends ClickedEventMetadata>(
    event: ClickEvent,
    customData?: T
  ) => {
    console.log('Amplitude.trackClicked', { event, customData })
    const result = await amplitudeTrack({
      event_type: String(event),
      event_properties: {
        ...customData,
      },
      user_properties: {
        ...account,
      },
    }).promise
    console.log('Amplitude.trackClicked result', result)
  }

  const trackOpened = async <T extends OpenedEventMetadata>(event: OpenEvent, customData?: T) => {
    console.log('Amplitude.trackOpened', { event, customData })
    const result = await amplitudeTrack({
      event_type: String(event),
      event_properties: {
        ...customData,
      },
      user_properties: {
        ...account,
      },
    }).promise
    console.log('Amplitude.trackOpened result', result)
  }

  const trackLogin = async <T extends LoginEventMetadata>(event: LoginEvent, customData?: T) => {
    console.log('Amplitude.trackLogin', { event, customData })
    const result = await amplitudeTrack({
      event_type: String(event),
      event_properties: {
        ...customData,
      },
      user_properties: {
        ...account,
      },
    }).promise
    console.log('Amplitude.trackLogin result', result)
  }

  const trackCopied = async <T extends CopiedEventMetadata>(event: CopyEvent, customData?: T) => {
    console.log('Amplitude.trackCopied', { event, customData })
    const result = await amplitudeTrack({
      event_type: String(event),
      event_properties: {
        ...customData,
      },
      user_properties: {
        ...account,
      },
    }).promise
    console.log('Amplitude.trackCopied result', result)
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

interface ITrackSignUp {
  email?: string
  web3WalletAddress?: string
  smartWalletAddress?: string
}

export enum ChangeEvent {
  StrategyChanged = 'Strategy Changed',
  OutcomeChanged = 'Outcome Changed',
}

export enum ClickEvent {
  CreateOwnMarketClicked = 'Create Own Market Clicked',
  ExploreMarketsClicked = 'Explore Markets Clicked',
  SupportChatClicked = 'Support Chat Clicked',
  PricePresetClicked = 'Price Preset Clicked',
  ShareClicked = 'Share Clicked',
  OpenMarketClicked = 'Open Market Clicked',
  HeaderOptionClicked = 'Header Option Clicked',
  LogoutClicked = 'Logout Clicked',
  OpenCreatorProfileClicked = 'Open Creator Profile Clicked',
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

export type EventMetadata =
  | StrategyChangedMetadata
  | OutcomeChangedMetadata
  | SupportChatClickedMetadata
  | PricePresetClickedMetadata
  | ShareClickedMetadata
  | PageOpenedMetadata
  | OpenMarketClickedMetadata
  | HeaderOptionClickedMetadata
  | LoginWithFarcasterMetadata
  | WalletAddressCopiedMetadata

export interface AccountMetadata {
  email?: string
  web3WalletAddress?: Address
  smartWalletAddress?: Address
}

export type StrategyChangedType = 'Buy selected' | 'Sell selected'
export interface StrategyChangedMetadata {
  type: StrategyChangedType
  market: Address
}

export type OutcomeChangedChoice = 'Yes' | 'No'
export interface OutcomeChangedMetadata {
  choice: OutcomeChangedChoice
  market: Address
}

export type CreateOwnMarketClickedPage = 'Explore Markets'
export interface CreateOwnMarketClickedMetadata {
  page: CreateOwnMarketClickedPage
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
  | 'Portfolio Page'
  | 'Deposit Page'
  | 'Explore Markets'
export interface PageOpenedMetadata {
  page: PageOpenedPage
  market?: Address
  [key: string]: any
}

export type OpenMarketClickedPage = 'Creator Cabinet' | 'Portfolio Page' | 'Explore Markets Clicked'
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

export type ChangedEventMetadata = StrategyChangedMetadata | OutcomeChangedMetadata
export type ClickedEventMetadata =
  | SupportChatClickedMetadata
  | PricePresetClickedMetadata
  | ShareClickedMetadata
  | OpenMarketClickedMetadata
  | HeaderOptionClickedMetadata
  | CreateOwnMarketClickedMetadata
export type OpenedEventMetadata = PageOpenedMetadata
export type LoginEventMetadata = LoginWithFarcasterMetadata
export type CopiedEventMetadata = WalletAddressCopiedMetadata
