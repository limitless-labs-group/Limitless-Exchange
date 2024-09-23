import { useWeb3Auth } from '@/providers'
import { useEtherspot } from '@/services'
import { useAccount } from 'wagmi'
import { Address } from 'viem'

// Todo pick address from useAccount() and remove this
export function useWalletAddress(): Address | undefined {
  const { web3Auth } = useWeb3Auth()
  const { address } = useAccount()

  const { smartWalletAddress } = useEtherspot()

  if (web3Auth.status === 'not_ready') {
    return
  }

  if (smartWalletAddress) {
    return smartWalletAddress
  }

  if (web3Auth.connectedAdapterName) {
    if (web3Auth.connectedAdapterName === 'openlogin' && !smartWalletAddress) {
      return
    }
  }
  return address
}
