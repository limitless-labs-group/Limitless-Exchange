'use client'

import { useEffect, createContext, PropsWithChildren, useContext } from 'react'
import { init, track as amplitudeTrack } from '@amplitude/analytics-browser'
import {
  EventChanged,
  EventClicked,
  EventCopied,
  EventLogin,
  EventMetadata,
  EventOpened,
} from '@/types'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''

interface IAmplitudeContext {
  trackSignUp: ({ email, web3WalletAddress, smartWalletAddress }: ITrackSignUp) => void
  trackChanged: <T>(event: EventChanged, metadata?: EventMetadata<T>) => void
  trackClicked: <T>(event: EventClicked, metadata?: EventMetadata<T>) => void
  trackOpened: <T>(event: EventOpened, metadata?: EventMetadata<T>) => void
  trackLogin: <T>(event: EventLogin, metadata?: EventMetadata<T>) => void
  trackCopied: <T>(event: EventCopied, metadata?: EventMetadata<T>) => void
}

const AmplitudeContext = createContext<IAmplitudeContext>({} as IAmplitudeContext)

export const useAmplitude = () => useContext(AmplitudeContext)

export const AmplitudeProvider = ({ children }: PropsWithChildren) => {
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

  function trackChanged<T>(event: EventChanged, metadata?: EventMetadata<T>) {
    amplitudeTrack(String(event), metadata)
  }

  function trackClicked<T>(event: EventClicked, metadata?: EventMetadata<T>) {
    amplitudeTrack(String(event), metadata)
  }

  function trackOpened<T>(event: EventOpened, metadata?: EventMetadata<T>) {
    amplitudeTrack(String(event), metadata)
  }

  function trackLogin<T>(event: EventLogin, metadata?: EventMetadata<T>) {
    amplitudeTrack(String(event), metadata)
  }

  function trackCopied<T>(event: EventCopied, metadata?: EventMetadata<T>) {
    amplitudeTrack(String(event), metadata)
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
