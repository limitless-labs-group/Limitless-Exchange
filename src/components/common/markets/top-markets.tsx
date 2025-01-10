import { Box } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import CarouselDesktop from '@/components/common/carousel/carousel-desktop/carousel-desktop'
import BigBanner from '@/components/common/markets/big-banner'
import Skeleton from '@/components/common/skeleton'
import { Market } from '@/types'

interface TopMarketsProps {
  markets: Market[]
  isLoading: boolean
}

export default function TopMarkets({ markets, isLoading }: TopMarketsProps) {
  const desktopCards =
    markets.map((market) => <BigBanner market={market} key={market.address} markets={markets} />) ??
    []

  return (
    <Box position='relative' mt={isMobile ? '12px' : '16px'} px={isMobile ? '16px' : 0} w='inherit'>
      {isLoading ? (
        <Skeleton height={isMobile ? 224 : 338} />
      ) : (
        <CarouselDesktop slides={desktopCards} />
      )}
    </Box>
  )
}
