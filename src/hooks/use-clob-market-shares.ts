import { useQuery } from '@tanstack/react-query'
import { Address, getContract } from 'viem'
import { conditionalTokensABI } from '@/contracts'
import { publicClient } from '@/providers'
import { useAccount } from '@/services'

export default function useClobMarketShares(slug?: string, tokens?: { yes: string; no: string }) {
  const { account } = useAccount()
  return useQuery({
    queryKey: ['market-shares', slug, tokens, account],
    queryFn: async () => {
      if (tokens && slug) {
        const contract = getContract({
          address: process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
          abi: conditionalTokensABI,
          client: publicClient,
        })
        return contract.read.balanceOfBatch([
          [account, account],
          [tokens.yes, tokens.no],
        ]) as Promise<bigint[]>
      }
    },
    enabled: !!slug && !!tokens,
  })
}
