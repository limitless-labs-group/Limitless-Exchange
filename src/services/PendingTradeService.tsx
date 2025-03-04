import { useRouter } from 'next/navigation'
import { useMarket } from './MarketsService'
import { MarketOrderType } from '@/types'

const usePendingTrade = () => {
  const router = useRouter()
  const pendingTradeData =
    typeof window !== 'undefined' ? localStorage.getItem('pendingTrade') : null

  let parsedData: PendingTradeData | null = null
  let marketSlug: string | undefined

  try {
    if (pendingTradeData) {
      parsedData = JSON.parse(pendingTradeData)
      marketSlug = parsedData?.marketSlug
    }
  } catch (error) {
    console.error('Error parsing pending trade data:', error)
  }

  const { data: market } = useMarket(marketSlug)

  const handleRedirect = async () => {
    if (!parsedData) {
      return
    }

    try {
      const { href } = parsedData
      router.push(href || '/')
    } catch (error) {
      console.error('Error processing pending trade data:', error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingTrade')
      }
    }
  }

  return { handleRedirect, pendingTradeData: parsedData, market }
}

export default usePendingTrade

export interface PendingTradeData {
  price: string
  marketSlug: string
  sharesAmount?: string
  strategy: 'Buy' | 'Sell'
  outcome: number
  orderType: MarketOrderType
  pathname: string
  search: string
  href: string
  queryParams: Record<string, string>
}
