import { defaultChain, newSubgraphURI } from '@/constants'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Address, getAddress } from 'viem'

export interface IUseConditionalTokensAddr {
  marketAddr: Address | undefined
}

export const useConditionalTokensAddr = ({ marketAddr }: IUseConditionalTokensAddr) => {
  return useQuery({
    queryKey: [useConditionalTokensAddr.name, marketAddr],
    queryFn: async () => {
      if (!marketAddr) {
        return
      }
      return getConditionalTokenAddress(marketAddr)
    },
    enabled: !!marketAddr,
  })
}

export const getConditionalTokenAddress = async (marketAddress: Address) => {
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
                    _ilike: "${marketAddress}" 
                  } 
                }
              ) {
                conditionalTokens
              }
            }
          `,
    },
  })
  const [data] = res.data.data?.[queryName] as { conditionalTokens: string }[]
  return getAddress(data.conditionalTokens)
}
