/** eslint-ignore @typescript-eslint/no-empty-interface */

export enum EventChanged {
  StrategyChanged = 'Strategy Changed',
  OutcomeChanged = 'Outcome Changed',
}

export enum EventClicked {
  SupportChatClicked = 'Support Chat Clicked',
  PricePresetClicked = 'Price Preset Clicked',
  ShareClicked = 'Share Clicked',
  OpenMarketClicked = 'Open Market Clicked',
  HeaderOptionClicked = 'Header Option Clicked',
  LogoutClicked = 'Logout Clicked',
  OpenCreatorProfileClicked = 'Open Creator Profile Clicked',
}

export enum EventLogin {
  LoginWithFarcaster = 'Login with Farcaster',
}

export enum EventOpened {
  PageOpened = 'Page Opened',
  LoginWindowOpened = 'Login Window Opened',
}

export enum EventCopied {
  WalletAddressCopied = 'Wallet Address Copied',
}

export type EventType = EventChanged | EventClicked | EventLogin | EventOpened | EventCopied

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
  account?: {
    email?: string
    smartWallet?: string
    web3?: string
  }
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
