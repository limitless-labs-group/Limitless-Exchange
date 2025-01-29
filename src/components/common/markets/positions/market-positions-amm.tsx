import MarketGroupPredictions from '@/components/common/markets/market-group-predictions'
import MarketGroupPositions from '@/app/(markets)/market-group/[slug]/components/market-group-positions'
import { MarketPositions } from '@/app/(markets)/markets/[address]/components'
import { useTradingService } from '@/services'

export default function MarketPositionsAmm() {
  const { market, marketGroup } = useTradingService()
  return (
    <>
      {marketGroup ? (
        <MarketGroupPositions marketGroup={marketGroup} />
      ) : (
        <MarketPositions market={market ? market : undefined} isSideMarketPage />
      )}
      <MarketGroupPredictions />
    </>
  )
}
