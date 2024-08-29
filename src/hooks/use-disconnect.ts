import { useDisconnect } from 'wagmi'
import { useAccount, useProfileService } from '@/services'
import { useCallback } from 'react'

export default function useDisconnectAccount() {
  const { resetState } = useProfileService()
  const { disconnectAccount } = useAccount()
  const { disconnect } = useDisconnect()

  const disconnectFromPlatform = useCallback(() => {
    disconnect()
    disconnectAccount()
    resetState()
  }, [])

  return { disconnectFromPlatform }
}
