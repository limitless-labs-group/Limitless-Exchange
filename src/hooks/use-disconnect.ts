import { useDisconnect } from 'wagmi'
import { useAccount, useProfileService } from '@/services'
import { useCallback, useEffect } from 'react'

export default function useDisconnectAccount() {
  const { disconnect, isSuccess: disconnectSuccess, isPending: disconnectLoading } = useDisconnect()
  const { disconnectAccount } = useAccount()
  const { resetState: resetProfileServiceState } = useProfileService()

  const disconnectFromPlatform = useCallback(() => {
    disconnect()
    disconnectAccount()
  }, [])

  useEffect(() => {
    if (disconnectSuccess) {
      resetProfileServiceState()
    }
  }, [disconnectSuccess])

  return { disconnectFromPlatform, disconnectSuccess, disconnectLoading }
}
