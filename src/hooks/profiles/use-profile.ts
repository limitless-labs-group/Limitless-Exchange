import { limitlessApi, useEtherspot } from '@/services'
import { Address, getAddress } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { Profile } from '@/types/profiles'
import { useWeb3Service } from '@/services/Web3Service'
import { useWalletAddress } from '@/hooks/use-wallet-address'

export const useProfile = () => {
  const { client } = useWeb3Service()
  const walletAddress = useWalletAddress()
  const { smartWalletExternallyOwnedAccountAddress } = useEtherspot()
  const account = client === 'eoa' ? walletAddress : smartWalletExternallyOwnedAccountAddress

  return useQuery({
    queryKey: ['profiles', { account }],
    queryFn: async (): Promise<Profile> => {
      const res = await limitlessApi.get(`/profiles/${getAddress(account!)}`)
      return <Profile>res.data
    },
    enabled: !!account,
  })
}
