import GroupMarketSectionDesktop from '@/app/(markets)/markets/[address]/components/group-market-section-desktop'
import { useTradingService } from '@/services'

export default function GroupMarketsSection() {
  const { groupMarket } = useTradingService()

  return groupMarket?.markets?.map((market) => (
    <GroupMarketSectionDesktop key={market.slug} market={market} />
  ))
}
