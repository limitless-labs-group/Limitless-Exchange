'use client'

import { init, track as amplitudeTrack } from '@amplitude/analytics-browser'
import * as sessionReplay from '@amplitude/session-replay-browser'
import { useEffect, createContext, PropsWithChildren, useContext, useCallback } from 'react'
import { ClobPositionType } from '@/app/(markets)/markets/[address]/components/clob/types'
import { PageName } from '@/hooks/use-page-name'
import { useAccount } from '@/services'
import { Category, LeaderboardSort, MarketGroup } from '@/types'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''

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
  const { account: walletAddress } = useAccount()

  useEffect(() => {
    init(AMPLITUDE_API_KEY, undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: false,
        attribution: true,
        formInteractions: false,
      },
    })
    //   .promise.then(() => {
    //   sessionReplay.init(AMPLITUDE_API_KEY, {
    //     deviceId: getDeviceId(),
    //     sessionId: getSessionId(),
    //     sampleRate: 0.1,
    //     sessionReplayId: uuidv4(),
    //   })
    // })
  }, [])

  const trackEvent = useCallback(
    async (eventType: EventType, customData?: EventMetadata) => {
      const queryPart = window.location.search.split('?')
      const queryString = queryPart[queryPart.length - 1]
      const decodedQuery = decodeURIComponent(queryString)
      const urlParams = new URLSearchParams(decodedQuery)
      if (window.location.origin !== 'https://limitless.exchange') {
        return
      }

      return amplitudeTrack({
        event_type: String(eventType),
        event_properties: {
          ...customData,
          ...sessionReplay.getSessionReplayProperties(),
          ...(urlParams.get('utm_source') ? { utm_source: urlParams.get('utm_source') } : {}),
          ...(urlParams.get('utm_medium') ? { utm_medium: urlParams.get('utm_medium') } : {}),
          ...(urlParams.get('utm_campaign') ? { utm_campaign: urlParams.get('utm_campaign') } : {}),
          ...(urlParams.get('utm_term') ? { utm_term: urlParams.get('utm_term') } : {}),
          ...(urlParams.get('utm_content') ? { utm_content: urlParams.get('utm_content') } : {}),
        },
        user_properties: {
          account: walletAddress,
          walletAddress,
        },
      }).promise
    },
    [walletAddress]
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
  LeaderboardViewChanged = 'Leaderboard View Changed',
  LeaderboardPageChanged = 'Leaderboard Page Changed',
  OrderBookSideChanged = 'Orderbook Side Changed',
  ClobPositionsTabChanged = 'Clob Positions Tab Changed',
  ClobWidgetModeChanged = 'Clob Widget Mode Changed',
  ChartTabChanged = 'Chart View Changed',
  PortfolioClobViewChanged = 'Portfolio/Orders View Changed',
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
  BuyCryptoClicked = 'Buy Crypto Clicked',
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
  MediumMarketBannerClicked = 'Medium Market Banner Clicked',
  RegularMarketBannerClicked = 'Regular Market Banner Clicked',
  BigBannerClicked = 'BigBannerClicked',
  QuickBetClicked = 'Quick Bet Clicked',
  NevermindButtonClicked = 'Nevermind Button Clicked',
  TradingWidgetReturnDecomposition = 'Trading Widget Return Decomposition',
  CloseMarketClicked = 'Close Market Clicked',
  SidebarMarketOpened = 'Sidebar Market Opened',
  FeedMarketClicked = 'Feed Market Clicked',
  PortfolioMarketClicked = 'PortfolioMarketClicked',
  OrderBookOpened = 'Order book Opened',
  NextMarketClick = 'Next Market Click',
  PreviousMarketClick = 'Previous Market Click',
  TradingWidgetPricePrecetChosen = 'Trading Widget Price Preset Chosen',
  SplitSharesAmountPercentClicked = 'Split Shares Amount Percent Clicked',
  FullPageClicked = 'Full Page Clicked',
  JoinPredictionClicked = 'Join Prediction Clicked',
  EstimateEarningClicked = 'Estimate Earnings Clicked',
  ThreeDotsClicked = 'Three Dots Clicked',
  BlockedUserClicked = 'Blocked User Clicked',
  UndoBlockingUser = 'Undo Blocking User',
  UserMarketClicked = 'User Market Clicked',
  UpgradeWalletClicked = 'Upgrade Wallet Clicked',
  RewardsButtonClicked = 'Rewards Button Clicked',
  SplitContractsModalClicked = 'Split Contracts Modal Clicked',
  MergeContractsModalClicked = 'Merge Contracts Modal Clicked',
  SplitSharesConfirmed = 'Split Contracts Confirmed',
  MergeSharesConfirmed = 'Merge Contracts Confirmed',
  MergeSharesModalMaxSharesClicked = 'Merge Contracts Modal Max Button Clicked',
}

export enum SignInEvent {
  SignIn = 'Sign In',
  SignInWithFarcaster = 'Login with Farcaster',
}

export enum OpenEvent {
  PageOpened = 'Page Opened',
  LoginWindowOpened = 'Login Window Opened',
  ProfileSettingsOpened = 'Profile Settings Opened',
  MarketPageOpened = 'Market Page Opened',
  SidebarMarketOpened = 'Sidebar Market Opened',
}

export enum AuthenticationEvent {
  SignUp = 'Sign Up',
}

export interface AccountMetadata {
  email?: string
  web3WalletAddress?: string
  smartWalletAddress?: string
}

export type OrderBookSideChangedType = 'Yes selected' | 'No selected'

export type ClobPositionsTabChanges = ClobPositionType

export type StrategyChangedType = 'Buy selected' | 'Sell selected'

export interface ClobPositionsTabChangesMetadata {
  type: ClobPositionsTabChanges
  marketAddress: string
}

export interface OrderBookSideChangedMetadata {
  type: OrderBookSideChangedType
  marketAddress: string
}

export interface StrategyChangedMetadata {
  type: StrategyChangedType
  marketAddress: string
  marketMarketType: 'AMM' | 'CLOB'
}

export interface OutcomeChangedMetadata {
  choice: OutcomeChangedChoice
  marketAddress: string
}

export type OutcomeChangedChoice = 'Yes' | 'No'
export type WalletType = 'eoa' | 'etherspot'
export interface TradeClickedMetadata {
  outcome: OutcomeChangedChoice
  walletType: WalletType
  marketAddress: string
  marketType?: 'group' | 'single'
}

export interface ClickedApproveMetadata {
  address: string
}

export interface ClickedWithdrawMetadata {
  coin: string
}
export interface LogoClickedMetadata {
  page: PageName
}

export interface CreateMarketClickedMetadata {
  page: PageName
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

export type SupportChatClickedPage = 'Deposit Page' | 'Header Dropdown Menu' | 'Home' | 'Lumy'
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
  address?: string
  marketType: 'group' | 'single'
}

interface MarketChangeInGroupData {
  marketGroup: MarketGroup
}

interface FeeAndReturnTradingDetailsClicked {
  from: 'percentage' | 'numbers'
  to: 'percentage' | 'numbers'
  platform: 'desktop' | 'mobile'
  marketAddress: string
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
  marketAddress?: string
  category?: string
  [key: string]: any
}

export interface SidebarMarketOpenedMetadata {
  marketAddress?: string
  category?: Category | string
  marketTags?: string[]
  marketType: 'single' | 'group'
}

interface FullPageClickedMetaData {
  marketAddress?: string
  marketType?: 'group' | 'single'
  marketTags?: string[]
}

export interface CloseMarketMetadata {
  marketAddress: string
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

export type LeaderboardViewChangedMetadata = {
  option: LeaderboardSort
}

export type LeaderboardPageChangedMetadata = {
  from: number
  to: number
}

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
  | 'Lumy'
  | 'Leaderboard'
  | 'My Markets'
export interface ProfileBurgerMenuClickedMetadata {
  option: ProfileBurgerMenuClickedOption
}

interface TradingWidgetPriceClickedMetadata {
  amount: number
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

export interface MediumBannerClicked {
  bannerPosition: number
  bannerPaginationPage: number
}

interface RewardsButtonClickedMetadata {
  visible: 'off' | 'on'
}

interface ClobWidgetModeChangedMetadata {
  mode: 'amm on' | 'clob on'
}

interface ChartTabChangedMetadata {
  view: string
}

export type ChangedEventMetadata =
  | StrategyChangedMetadata
  | OutcomeChangedMetadata
  | ProfilePictureUploadedChangedMetadata
  | ProfileSettingsChangedMetadata
  | LeaderboardViewChangedMetadata
  | LeaderboardPageChangedMetadata
  | OrderBookSideChangedMetadata
  | ClobPositionsTabChangesMetadata
  | ClobWidgetModeChangedMetadata
  | ChartTabChangedMetadata
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
  | MarketChangeInGroupData
  | FeeAndReturnTradingDetailsClicked
  | MediumBannerClicked
  | CloseMarketMetadata
  | TradingWidgetPriceClickedMetadata
  | FullPageClickedMetaData
  | RewardsButtonClickedMetadata

export type OpenedEventMetadata =
  | PageOpenedMetadata
  | ProfileSettingsMetadata
  | SidebarMarketOpenedMetadata
export type SignInEventMetadata = SignInWithFarcasterMetadata
export type CopiedEventMetadata = WalletAddressCopiedMetadata

export type EventMetadata =
  | ChangedEventMetadata
  | ClickedEventMetadata
  | OpenedEventMetadata
  | SignInEventMetadata
  | CopiedEventMetadata
