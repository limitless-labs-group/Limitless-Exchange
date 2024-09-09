import { useDisconnect } from 'wagmi'
import { useAccount, useProfileService } from '@/services'
import { useCallback, useEffect, useMemo } from 'react'

export default function useDisconnectAccount() {
  const { disconnect, isSuccess: disconnectSuccess, isPending: disconnectPending } = useDisconnect()
  const { disconnectAccount, account } = useAccount()
  const { resetState: resetProfileServiceState } = useProfileService()

  const disconnectFromPlatform = useCallback(() => {
    disconnect()
    disconnectAccount()
  }, [])

  useEffect(() => {
    if (!disconnectPending && disconnectSuccess) {
      resetProfileServiceState()
    }
  }, [disconnectPending, disconnectSuccess])

  const disconnectLoading = useMemo<boolean>(() => {
    return !!account && disconnectPending
  }, [disconnectPending, account])

  return { disconnectFromPlatform, disconnectSuccess, disconnectLoading }
}
