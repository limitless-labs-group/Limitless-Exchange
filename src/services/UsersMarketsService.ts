import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { defaultChain, newSubgraphURI } from '@/constants'
import { useWalletAddress } from '@/hooks/use-wallet-address'

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
  const address = useWalletAddress()
  return useQuery<AccountMarketResponse[]>({
    queryKey: ['createdMarkets', address],
    queryFn: async () => {
      if (!address) {
        return []
      }
      const queryName = 'GetAccountDetails'
      const response = await axios.request({
        url: newSubgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `query ${queryName}  {
            AccountMarket(
              where: {
                account_id: { 
                  _ilike: "${address}" 
                }
              }
              order_by: { collateralsLocked: desc }
            ) {
              account_id
              market {
                id
                closed
                conditionId: condition_id
                collateral {
                  id
                  name
                  symbol
                }
                condition {
                  resolutionTimestamp
                }
              }
              collateralsInvested
              collateralsLocked
            }
          }`,
        },
      })
      return response.data.data['AccountMarket']
    },
    enabled: !!address,
  })
}
