import GroupMarketSectionDesktop from '@/app/(markets)/markets/[address]/components/group-market-section-desktop'
import GroupMarketsSectionMobile from '@/app/(markets)/markets/[address]/components/group-markets-section-mobile'
import { useTradingService } from '@/services'

interface GroupMarketsSectionProps {
  mobileView: boolean
}

export default function GroupMarketsSection({ mobileView }: GroupMarketsSectionProps) {
  const { groupMarket } = useTradingService()

  return groupMarket?.markets?.map((market) =>
    mobileView ? (
      <GroupMarketsSectionMobile key={market.slug} market={market} />
    ) : (
      <GroupMarketSectionDesktop key={market.slug} market={market} />
    )
  )
}
