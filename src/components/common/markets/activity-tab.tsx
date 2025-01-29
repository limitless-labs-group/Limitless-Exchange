import ActivityAmm from '@/components/common/markets/activity/activity-amm'
import ActivityClob from '@/components/common/markets/activity/activity-clob'
import { useTradingService } from '@/services'

export default function MarketActivityTab() {
  const { market } = useTradingService()
  return market?.tradeType === 'clob' ? <ActivityClob /> : <ActivityAmm />
}
