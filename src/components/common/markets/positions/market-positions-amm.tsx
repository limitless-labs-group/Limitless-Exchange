import { MarketPositions } from '@/app/(markets)/markets/[address]/components'
import { useTradingService } from '@/services'

export default function MarketPositionsAmm() {
  const { market } = useTradingService()
  return <MarketPositions market={market ? market : undefined} isSideMarketPage />
}
