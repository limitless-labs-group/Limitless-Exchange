'use client'

import { useEffect, createContext, PropsWithChildren, useContext } from 'react'
import { init, track as amplitudeTrack } from '@amplitude/analytics-browser'
import {
  ChangedEvent,
  ClickedEvent,
  CopiedEvent,
  LoginEvent,
  EventMetadata,
  OpenedEvent,
  ChangedEventValue,
  ClickedEventValue,
  OpenedEventValue,
  LoginEventValue,
  CopiedEventValue,
} from '@/types'
import { useAccount } from '@/services'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''

interface IAmplitudeContext {
  trackSignUp: ({ email, web3WalletAddress, smartWalletAddress }: ITrackSignUp) => void
  trackChanged: (event: ChangedEvent, value?: ChangedEventValue) => void
  trackClicked: (event: ClickedEvent, value?: ClickedEventValue) => void
  trackOpened: (event: OpenedEvent, value?: OpenedEventValue) => void
  trackLogin: (event: LoginEvent, value?: LoginEventValue) => void
  trackCopied: (event: CopiedEvent, value?: CopiedEventValue) => void
}

const AmplitudeContext = createContext<IAmplitudeContext>({} as IAmplitudeContext)

export const useAmplitude = () => useContext(AmplitudeContext)

export const AmplitudeProvider = ({ children }: PropsWithChildren) => {
  const { accountMetadata } = useAccount()

  useEffect(() => {
    init(AMPLITUDE_API_KEY, undefined, {
      defaultTracking: {
        sessions: true,
      },
    })
  }, [])

  const trackSignUp = ({ email, web3WalletAddress, smartWalletAddress }: ITrackSignUp) => {
    amplitudeTrack('Sign Up', {
      email,
      web3WalletAddress,
      smartWalletAddress,
    })
  }

  function trackChanged(event: ChangedEvent, value?: ChangedEventValue) {
    amplitudeTrack(String(event), {
      account: accountMetadata,
      value,
    })
  }

  function trackClicked(event: ClickedEvent, value?: ClickedEventValue) {
    amplitudeTrack(String(event), {
      account: accountMetadata,
      value,
    })
  }

  function trackOpened(event: OpenedEvent, value?: OpenedEventValue) {
    amplitudeTrack(String(event), {
      account: accountMetadata,
      value,
    })
  }

  function trackLogin(event: LoginEvent, value?: LoginEventValue) {
    amplitudeTrack(String(event), {
      account: accountMetadata,
      value,
    })
  }

  function trackCopied(event: CopiedEvent, value?: CopiedEventValue) {
    amplitudeTrack(String(event), {
      account: accountMetadata,
      value,
    })
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
