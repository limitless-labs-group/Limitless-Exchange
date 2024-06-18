import { defaultChain, newSubgraphURI } from '@/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import axios from 'axios'

export type OutcomeIndex = 1 | 0

export interface IUseWinningOutcomeIndex {
  marketAddr: Address | undefined
}

export const useWinningOutcomeIndex = ({ marketAddr }: IUseWinningOutcomeIndex) => {
  return useQuery<OutcomeIndex | undefined>({
    queryKey: [useWinningOutcomeIndex.name, marketAddr],
    queryFn: async () => {
      if (!marketAddr) {
        return undefined
      }
      const queryName = 'AutomatedMarketMaker'
      const res = await axios.request({
        url: newSubgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `
            query ${queryName} {
              ${queryName} (
                where: {
                  id: { 
                    _ilike: "${marketAddr}" 
                  } 
                }
              ) {
                condition {
                  payoutNumerators
                }
              }
            }
          `,
        },
      })
      const [data] = res.data.data?.[queryName] as { payoutNumerators: OutcomeIndex[] }[]

      const resolved = data.payoutNumerators !== null
      if (!resolved) {
        return undefined
      }

      const winningIndex = <OutcomeIndex>(
        data.payoutNumerators.findIndex((payoutNumerator) => payoutNumerator === 1)
      )
      return winningIndex
    },
    enabled: !!marketAddr,
  })
}
