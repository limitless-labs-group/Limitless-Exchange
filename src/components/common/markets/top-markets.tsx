import { MarketSingleCardResponse } from '@/types'
import BigBanner from '@/components/common/markets/big-banner'
import CarouselDesktop from '@/components/common/carousel/carousel-desktop/carousel-desktop'
import { Box, useOutsideClick } from '@chakra-ui/react'
import { useTradingService } from '@/services'
import React, { LegacyRef, MutableRefObject, useRef, useState } from 'react'
import { dailyMarketToMarket } from '@/utils/market'
import { MarketTradingForm } from '@/app/(markets)/markets/[address]/components'
import { isMobile } from 'react-device-detect'

interface TopMarketsProps {
  markets: MarketSingleCardResponse[]
}

export default function TopMarkets({ markets }: TopMarketsProps) {
  const [tradingMenuOpened, setTradingMenuOpened] = useState(false)
  const { setMarket, market: selectedMarket } = useTradingService()
  const ref = useRef<HTMLElement>()

  const onMarketSelect = (market: MarketSingleCardResponse) => {
    setMarket(dailyMarketToMarket(market))
    setTradingMenuOpened(true)
  }

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => {
      setTradingMenuOpened(false)
    },
  })

  const desktopCards = markets.map((market, index) => (
    <BigBanner
      market={market}
      key={market.address}
      onMarketSelect={onMarketSelect}
      index={index + 1}
    />
  ))

  return (
    <Box position='relative' mt={isMobile ? '12px' : 0} px={isMobile ? '16px' : 0}>
      <CarouselDesktop slides={desktopCards} />
      {tradingMenuOpened && selectedMarket && (
        <Box position='absolute' top='0' right={'-352px'} ref={ref as LegacyRef<HTMLDivElement>}>
          <MarketTradingForm
            market={selectedMarket}
            analyticParams={{ quickBetSource: 'Big banner', source: 'Quick Bet' }}
            showTitle={true}
          />
        </Box>
      )}
    </Box>
  )
}
