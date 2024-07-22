import { useDisconnect } from 'wagmi'
import { useAccount } from '@/services'

export default function useDisconnectAccount() {
  const { disconnect } = useDisconnect()
  const { disconnectAccount } = useAccount()
  const disconnectFromPlatform = () => {
    disconnect()
    disconnectAccount()
  }

  return { disconnectFromPlatform }
}
