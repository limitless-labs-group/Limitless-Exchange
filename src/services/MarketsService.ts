import { useQuery } from '@tanstack/react-query'
import { useEtherspot } from '@/services/Etherspot'
import axios from 'axios'
import { defaultChain, newSubgraphURI } from '@/constants'

export type AccountMarketResponse = {
  account_id: string
  market: {
    id: string
    closed: boolean
    collateral: {
      id: string
      name: string
      symbol: string
    }
  }
  collateralsInvested: string
  collateralsLocked: string
}

export function useUsersMarkets() {
  const { smartWalletAddress } = useEtherspot()
  return useQuery<AccountMarketResponse[]>({
    queryKey: ['createdMarkets', smartWalletAddress],
    queryFn: async () => {
      if (!smartWalletAddress) {
        return []
      }
      const queryName = 'GetAccountDetails'
      const response = await axios.request({
        url: newSubgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `
          query ${queryName} {
            AccountMarket(
              where: {
                account_id: { _eq: "${smartWalletAddress}" }
                chainId: { _eq: ${defaultChain.id} }
              }
              order_by: { collateralsLocked: desc }
            ) {
              account_id
              market {
                id
                closed
                collateral {
                  id
                  name
                  symbol
                }
              }
              collateralsInvested
              collateralsLocked
            }
          }
          `,
        },
      })
      return response.data.data['AccountMarket']
    },
    enabled: !!smartWalletAddress,
  })
}
