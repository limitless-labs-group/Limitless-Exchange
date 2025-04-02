import { Accordion } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import GroupMarketSectionDesktop from '@/app/(markets)/markets/[address]/components/group-market-section-desktop'
import GroupMarketSectionSmall from '@/app/(markets)/markets/[address]/components/group-market-section-small'
import GroupMarketsSectionMobile from '@/app/(markets)/markets/[address]/components/group-markets-section-mobile'
import { useTradingService } from '@/services'

interface GroupMarketsSectionProps {
  mobileView: boolean
}

export default function GroupMarketsSection({ mobileView }: GroupMarketsSectionProps) {
  const { groupMarket } = useTradingService()

  const cards = groupMarket?.markets?.map((market) => {
    if (isMobile) {
      return <GroupMarketsSectionMobile key={market.slug} market={market} />
    }
    return mobileView ? (
      <GroupMarketSectionSmall key={market.slug} market={market} />
    ) : (
      <GroupMarketSectionDesktop key={market.slug} market={market} />
    )
  })

  return isMobile ? (
    <>{cards}</>
  ) : (
    <Accordion variant='paper' gap='8px' display='flex' flexDirection='column' allowToggle>
      {cards}
    </Accordion>
  )
}
