import { useAccount } from 'wagmi'
import type { Address } from 'viem'

import { useWeb3Auth } from '@/providers'
import { useEtherspot } from '@/services'

export function useWalletAddress(): Address | undefined {
  const { web3Auth } = useWeb3Auth()
  const { address } = useAccount()

  const { smartWalletAddress } = useEtherspot()

  if (web3Auth.connectedAdapterName !== 'openlogin') {
    return address
  }
  if (smartWalletAddress) {
    return smartWalletAddress
  }
  return
}
