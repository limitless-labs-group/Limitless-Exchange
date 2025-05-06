import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Address } from 'viem'
import { useAccount } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'

export function useNegriskClaimApprove() {
  const [negriskApproved, setNegRiskApproved] = useState(false)

  const { checkAllowanceForAll } = useWeb3Service()
  const { web3Wallet } = useAccount()

  const checkNegRiskClaimApprove = async () => {
    const isApproved = await checkAllowanceForAll(
      process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
    )
    setNegRiskApproved(isApproved)
  }

  const { isLoading } = useQuery({
    queryKey: ['isapproved-negrisk-claim', web3Wallet?.account?.address],
    queryFn: checkNegRiskClaimApprove,
    enabled: !!web3Wallet?.account?.address,
  })

  return {
    negriskApproved,
    isLoading: isLoading || !web3Wallet?.account?.address,
    setNegRiskApproved,
  }
}
