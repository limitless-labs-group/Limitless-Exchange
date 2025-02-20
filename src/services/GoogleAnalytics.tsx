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

  return { pushEvent }
}

export default useGoogleAnalytics
