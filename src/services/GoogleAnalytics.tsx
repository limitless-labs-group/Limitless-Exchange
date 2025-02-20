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

  const pushGA4Event = (event: GAEvents | undefined) => {
    if (!event) return
    pushEvent({
      event: 'GA4_event',
      event_name: event,
    })
  }

  return { pushEvent, pushGA4Event }
}

export default useGoogleAnalytics

export enum GAEvents {
  ClickLogin = 'click_login',
  SelectWalletMetamask = 'select_wallet_metamask',
  SelectWalletCoinbase = 'select_wallet_coinbase',
  SelectWalletRainbow = 'select_wallet_rainbow',
  SelectWalletWalletConnect = 'select_wallet_walletconnect',
  SelectAnyWallet = 'select_any_wallet',
  WalletConnected = 'wallet_connected',
  ClickSection = 'click_section',
  ClickEndingSoon = 'click_endingsoon',
  ClickHighValue = 'click_highvalue',
  ClickHighVolume = 'click_highvolume',
  ClickNewest = 'click_newest',
  ClickLpRewards = 'click_lprewards',
  SocialDiscord = 'social_discord',
  SocialWarpcast = 'social_warpcast',
  SocialX = 'social_x',
}
