import ActivityAmm from '@/components/common/markets/activity/activity-amm'
import ActivityClob from '@/components/common/markets/activity/activity-clob'
import { useTradingService } from '@/services'

interface MarketActivityTabProps {
  isActive: boolean
}

export default function MarketActivityTab({ isActive }: MarketActivityTabProps) {
  const { market } = useTradingService()
  return market?.tradeType === 'clob' ? <ActivityClob /> : <ActivityAmm isActive={isActive} />
}
