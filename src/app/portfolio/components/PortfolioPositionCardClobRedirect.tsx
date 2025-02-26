import { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import PortfolioPositionCardClob from '@/app/portfolio/components/PortfolioPositionCardClob'
import { ClickEvent, ClobPositionWithType, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { MarketStatus } from '@/types'

const unhoveredColors = {
  main: 'grey.800',
  secondary: 'grey.500',
  contracts: '',
}

const hoverColors = {
  main: 'white',
  secondary: 'transparent.700',
  contracts: 'white',
}

type PortfolioPositionCardClobRedirectProps = {
  position: ClobPositionWithType
}

export default function PortfolioPositionCardClobRedirect({
  position,
}: PortfolioPositionCardClobRedirectProps) {
  const { setMarket, setMarketGroup } = useTradingService()
  const [colors, setColors] = useState(unhoveredColors)

  const { trackClicked } = useAmplitude()
  const { onOpenMarketPage } = useTradingService()

  const marketClosed = position.market.status === MarketStatus.RESOLVED

  const { data: oneMarket, refetch: refetchMarket } = useMarket(position.market.slug, false, false)

  const handleOpenMarketPage = async () => {
    if (!oneMarket) {
      const { data: fetchedMarket } = await refetchMarket()
      if (fetchedMarket) {
        onOpenMarketPage(fetchedMarket)
        trackClicked(ClickEvent.PortfolioMarketClicked, {
          marketCategory: fetchedMarket.category,
          marketAddress: fetchedMarket.slug,
          marketType: 'single',
          marketTags: fetchedMarket.tags,
          type: 'Portolio',
        })
      }
    } else {
      onOpenMarketPage(oneMarket)
      trackClicked(ClickEvent.PortfolioMarketClicked, {
        marketCategory: oneMarket.category,
        marketAddress: oneMarket.slug,
        marketType: 'single',
        marketTags: oneMarket.tags,
        type: 'Portolio',
      })
    }
  }

  const cardColors = useMemo(() => {
    if (marketClosed) {
      return {
        main: 'white',
        secondary: isMobile ? 'white' : 'transparent.700',
      }
    }
    return {
      main: colors.main,
      secondary: colors.secondary,
    }
  }, [marketClosed, colors.main, colors.secondary])

  const content = (
    <PortfolioPositionCardClob
      positionData={position}
      onClick={handleOpenMarketPage}
      onMouseEnter={() => setColors(hoverColors)}
      onMouseLeave={() => setColors(unhoveredColors)}
      cardColors={cardColors}
      _hover={{
        bg: marketClosed ? 'green.600' : 'blue.500',
      }}
      bg={marketClosed ? 'green.500' : 'grey.200'}
      cursor='pointer'
    />
  )

  return isMobile ? (
    <MobileDrawer
      trigger={content}
      variant='black'
      onClose={() => {
        setMarket(null)
        setMarketGroup(null)
      }}
    >
      <MarketPage />
    </MobileDrawer>
  ) : (
    content
  )
}
