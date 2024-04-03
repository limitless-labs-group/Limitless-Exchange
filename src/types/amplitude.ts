/** eslint-ignore @typescript-eslint/no-empty-interface */

import { IAccountContext } from '@/services'

export enum ChangedEvent {
  StrategyChanged = 'Strategy Changed',
  OutcomeChanged = 'Outcome Changed',
}

export enum ClickedEvent {
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

export enum OpenedEvent {
  PageOpened = 'Page Opened',
  LoginWindowOpened = 'Login Window Opened',
}

export enum CopiedEvent {
  WalletAddressCopied = 'Wallet Address Copied',
}

export type EventType = ChangedEvent | ClickedEvent | LoginEvent | OpenedEvent | CopiedEvent

export type EventMetadataValue =
  | StrategyChangedValue
  | OutcomeChangedValue
  | SupportChatClickedValue
  | PricePresetClickedValue
  | ShareClickedValue
  | PageOpenedValue
  | OpenMarketClickedValue
  | HeaderOptionClickedValue
  | LoginWithFarcasterValue
  | WalletAddressCopiedValue

export interface EventMetadata<T = EventMetadataValue> {
  account?: IAccountContext['accountMetadata']
  value: T
}

export type StrategyChangedValue = 'Buy selected' | 'Sell selected'

export type OutcomeChangedValue = 'Yes' | 'No'

export type SupportChatClickedValue = 'Deposit Page' | 'Header Dropdown Menu'

export type PricePresetClickedValue = '+1 clicked' | '+5 clicked' | '-1 clicked' | '-5 clicked'

export type ShareClickedValue = 'Copy Link' | 'X/Twitter' | 'Farcaster'

export type PageOpenedValue =
  | 'Market Page'
  | 'Creator Cabinet'
  | 'Investor Cabinet'
  | 'Deposit Page'
  | 'Explore Markets Clicked'

export type OpenMarketClickedValue =
  | 'Creator Cabinet'
  | 'Investor Cabinet'
  | 'Explore Markets Clicked'

export type HeaderOptionClickedValue =
  | 'Invite Friends'
  | 'Profile Icon'
  | 'Explore Markets'
  | 'Invested Clicked'
  | 'Balance Clicked'
  | 'To Win Clicked'
  | 'Become a Creator Clicked'

export type LoginWithFarcasterValue =
  | 'Farcaster'
  | 'Google'
  | 'X/Twitter'
  | 'Discord'
  | 'Email/Phone'

export type WalletAddressCopiedValue = 'Deposit'

export type ChangedEventValue = StrategyChangedValue | OutcomeChangedValue
export type ClickedEventValue =
  | SupportChatClickedValue
  | PricePresetClickedValue
  | ShareClickedValue
  | OpenMarketClickedValue
  | HeaderOptionClickedValue
export type OpenedEventValue = PageOpenedValue
export type LoginEventValue = LoginWithFarcasterValue
export type CopiedEventValue = WalletAddressCopiedValue
