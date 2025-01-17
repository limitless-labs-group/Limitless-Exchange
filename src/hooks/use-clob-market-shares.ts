import { useQuery } from '@tanstack/react-query'
import { Address, getContract } from 'viem'
import { conditionalTokensABI } from '@/contracts'
import { publicClient } from '@/providers'

export default function useClobMarketShares(slug?: string, tokens?: { yes: string; no: string }) {
  return useQuery({
    queryKey: ['market-shares', slug, tokens],
    queryFn: async () => {
      if (tokens && slug) {
        console.log(tokens)
        console.log(slug)
        const contract = getContract({
          address: process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
          abi: conditionalTokensABI,
          client: publicClient,
        })
        // @ts-ignore
        return contract.read.balanceOfBatch([address, address], [tokens.yes, tokens.no])
      }
    },
    enabled: !!slug && !!tokens,
  })
}
