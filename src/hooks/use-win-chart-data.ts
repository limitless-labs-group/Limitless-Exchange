import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useAccount } from '@/services'

interface UseWinChartDataProps {
  marketSlug: string | undefined
  enabled?: boolean
}

interface ChartDataPoint {
  datetime: number
  current_trader: boolean
  outcome_price: string
  outcome: string
  margin: string
}

export interface ChartDataResponse {
  bestBuy: ChartDataPoint
  bestBuyIndex: number
  boughtProbability: number
  outcome: string
  data: ChartDataPoint[]
}

export const useWinChartData = ({ marketSlug, enabled = true }: UseWinChartDataProps) => {
  const { account } = useAccount()

  return useQuery<ChartDataResponse>({
    queryKey: ['winChartData', marketSlug, account],
    queryFn: async () => {
      if (!marketSlug || !account) {
        throw new Error('Market slug and account are required')
      }

      // const chartUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/chart/${marketSlug}/${account}`
      const chartUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/chart/cmarket-1link-surge-after-institutional-by-jan-3-2027-1746787539524/0x453418e1A0233eeAe1E9dAA5f4ca0394a5afBe59`

      const response = await axios.get<ChartDataResponse>(chartUrl)
      return response.data
    },
    enabled: enabled && !!marketSlug && !!account,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
