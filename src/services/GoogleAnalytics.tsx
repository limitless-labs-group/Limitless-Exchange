import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: any[]
  }
}

type GAEvent = {
  event: string
  [key: string]: any
}

const useGoogleAnalytics = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
    }
  }, [])

  const pushEvent = (event: GAEvent) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(event)
    }
  }

  const pushGA4Event = (event: GAEvents | string | undefined) => {
    if (!event) return
    pushEvent({
      event: 'GA4_event',
      event_name: event,
    })
  }

  const pushPuchaseEvent = (data: Purchase) => {
    if (!data) return
    pushEvent({
      event: 'purchase',
      ecommerce: data,
    })
  }

  return { pushEvent, pushGA4Event, pushPuchaseEvent }
}

export default useGoogleAnalytics

export interface PurchaseItem {
  item_id: string
  item_name: string
  item_category: string
  price: number
  quantity: number
}

export interface Purchase {
  transaction_id: string
  value: number
  currency: string
  items: PurchaseItem[]
}

export enum GAEvents {
  ClickLogin = 'click_login',
  SelectWalletMetamask = 'select_wallet_metamask',
  SelectWalletCoinbase = 'select_wallet_coinbase',
  SelectWalletRainbow = 'select_wallet_rainbow',
  SelectWalletWalletConnect = 'select_wallet_walletconnect',
  SelectAnyWallet = 'select_any_wallet',
  SelectAnyMarket = 'select_any_market',
  WalletConnected = 'wallet_connected',
  ClickSection = 'click_section',
  ClickEndingSoon = 'click_endingsoon',
  ClickHighValue = 'click_highvalue',
  ClickTrending = 'click_trending',
  ClickHighVolume = 'click_highvolume',
  ClickNewest = 'click_newest',
  ClickLpRewards = 'click_lprewards',
  ClickBuy = 'click_buy',
  ClickBuyOrder = 'click_buy_order',
  SocialDiscord = 'social_discord',
  SocialWarpcast = 'social_warpcast',
  SocialX = 'social_x',
}
