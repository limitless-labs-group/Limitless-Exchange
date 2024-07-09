import { useWeb3Auth } from '@/providers'
import { useEtherspot } from '@/services'
import { useAccount } from 'wagmi'
import { Address } from 'viem'

export function useWalletAddress(): Address | undefined {
  const { web3Auth } = useWeb3Auth()
  const { address } = useAccount()

  const { smartWalletAddress } = useEtherspot()

  if (web3Auth.cachedAdapter !== 'openlogin') {
    return address
  }
  if (smartWalletAddress) {
    return smartWalletAddress
  }
  return
}
