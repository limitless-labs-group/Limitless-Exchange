import { useQuery } from '@tanstack/react-query'
import { Address, getContract } from 'viem'
import { conditionalTokensABI } from '@/contracts'
import { publicClient } from '@/providers'

export default function useClobMarketShares(address?: string, tokens?: string[]) {
  return useQuery({
    queryKey: ['market-shares', address, tokens],
    queryFn: async () => {
      if (tokens && address) {
        console.log(tokens)
        console.log(address)
        const contract = getContract({
          address: process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
          abi: conditionalTokensABI,
          client: publicClient,
        })
        // @ts-ignore
        return contract.read.balanceOfBatch([address, address], [...tokens])
      }
    },
    enabled: !!address && !!tokens,
  })
}
