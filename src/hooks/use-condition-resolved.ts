import { defaultChain, newSubgraphURI } from '@/constants'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Address, getAddress } from 'viem'

export interface IUseConditionResolved {
  marketAddr: Address | undefined
}

export const useConditionResolved = ({ marketAddr }: IUseConditionResolved) => {
  return useQuery({
    queryKey: [useConditionResolved.name, marketAddr],
    queryFn: async () => {
      if (!marketAddr) {
        return
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
                  resolutionTimestamp
                }
              }
            }
          `,
        },
      })
      const [data] = res.data.data?.[queryName] as { resolutionTimestamp: string }[]
      const resolved = data.resolutionTimestamp !== null
      console.log('resolved:', resolved)
      return resolved
    },
    enabled: !!marketAddr,
  })
}
