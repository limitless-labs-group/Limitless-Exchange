'use client'

import { useEffect, createContext, PropsWithChildren, useContext } from 'react'
import { init, track } from '@amplitude/analytics-browser'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''

interface IAmplitudeContext {
  trackSignUp: ({ email, web3WalletAddress, smartWalletAddress }: ITrackSignUp) => void
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
    track('Sign Up', {
      email,
      web3WalletAddress,
      smartWalletAddress,
    })
  }

  const contextProviderValue: IAmplitudeContext = { trackSignUp }

  return (
    <AmplitudeContext.Provider value={contextProviderValue}>{children}</AmplitudeContext.Provider>
  )
}

interface ITrackSignUp {
  email?: string
  web3WalletAddress?: string
  smartWalletAddress?: string
}
