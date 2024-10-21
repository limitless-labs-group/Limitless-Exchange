import { Box } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import CarouselDesktop from '@/components/common/carousel/carousel-desktop/carousel-desktop'
import BigBanner from '@/components/common/markets/big-banner'
import { Market } from '@/types'

interface TopMarketsProps {
  markets: Market[]
}

export default function TopMarkets({ markets }: TopMarketsProps) {
  const desktopCards = markets.map((market) => <BigBanner market={market} key={market.address} />)

  return (
    <Box position='relative' mt={isMobile ? '12px' : 0} px={isMobile ? '16px' : 0}>
      <CarouselDesktop slides={desktopCards} />
    </Box>
  )
}
