import { Box, Button, HStack, Text } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'
import CarouselDesktop from '@/components/common/carousel/carousel-desktop/carousel-desktop'
import MobileDrawer from '@/components/common/drawer'
import { BigBannerTrigger } from '@/components/common/markets/big-banner-trigger'
import { MarketCardLink } from '@/components/common/markets/market-cards/market-card-link'
import MarketPage from '@/components/common/markets/market-page'
import Skeleton from '@/components/common/skeleton'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import { useTradingService } from '@/services'
import { bannerTextDesktop, bannerTextMobile, bannerTextTablet } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { chunkArray } from '@/utils/array'

interface TopMarketsProps {
  markets: Market[]
  isLoading: boolean
}

export default function TopMarkets({ markets, isLoading }: TopMarketsProps) {
  const [screenWidth, setScreenWidth] = useState(0)
  const { onCloseMarketPage } = useTradingService()

  const isMobile = screenWidth < 768
  const isTablet = screenWidth <= 1024 && screenWidth >= 768
  const isDesktop = screenWidth > 1024

  const getCardsAmount = () => {
    if (isTablet || isDesktop) {
      return 3
    }
    return 1
  }

  const cardsAmount = getCardsAmount()

  const bannerUrl =
    isDesktop || isTablet
      ? '/assets/images/banners/banner-desktop.webp'
      : '"/assets/images/banners/banner-mobile.webp"'

  const textStyle = useMemo(() => {
    if (isDesktop) {
      return bannerTextDesktop
    }
    if (isTablet) {
      return bannerTextTablet
    }
    return bannerTextMobile
  }, [isDesktop, isTablet])

  const buttonPadding = useMemo(() => {
    if (isDesktop) {
      return '24px 32px'
    }
    return '16px 24px'
  }, [isDesktop])

  const buttonMargin = useMemo(() => {
    if (isDesktop) {
      return '64px'
    }
    if (isTablet) {
      return '32px'
    }
    return '48px'
  }, [isDesktop, isTablet])

  useEffect(() => {
    setScreenWidth(window.screen.width)
  }, [])

  if (isLoading || !markets) {
    return (
      <Box
        position='relative'
        mt={'16px'}
        px={isMobile ? '16px' : 0}
        w={isMobile ? 'inherit' : '664px'}
      >
        <Skeleton height={isMobile ? 224 : 338} />
      </Box>
    )
  }

  const desktopCards = isMobile
    ? markets?.map((market, index) => (
        <MobileDrawer
          key={market.slug}
          id={market.slug}
          trigger={<BigBannerTrigger market={market} markets={markets} index={index} />}
          variant='black'
          onClose={onCloseMarketPage}
          renderPrevNext={true}
        >
          <MarketPage />
        </MobileDrawer>
      ))
    : chunkArray(
        markets?.map((market, index) => (
          <MarketCardLink marketAddress={market.slug as Address} key={market.slug}>
            {<BigBannerTrigger market={market} markets={markets} index={index} />}
          </MarketCardLink>
        )),
        cardsAmount
      ).map((cards) => (
        <HStack key={cards[0].slug} justifyContent='space-between' w='full'>
          {cards}
        </HStack>
      ))

  const firstTextRow = isMobile ? (
    <Text {...textStyle} textTransform='uppercase' color='white'>
      TRADE
    </Text>
  ) : (
    <>
      <Text {...textStyle} textTransform='uppercase' color='white'>
        TRADE ON
      </Text>
      <Text {...textStyle} textTransform='uppercase' color='white'>
        LIMITLESS
      </Text>
    </>
  )

  const secondTextRow = isMobile ? (
    <Text {...textStyle} textTransform='uppercase' color='white'>
      on limitless &
    </Text>
  ) : (
    <HStack gap='2px' marginLeft='15%' color='white'>
      <ArrowRightIcon
        width={textStyle.fontSize}
        height={textStyle.fontSize}
        style={{
          minWidth: textStyle.fontSize,
        }}
      />
      <Text {...textStyle} textTransform='uppercase' color='white'>
        Forecast
      </Text>
    </HStack>
  )

  const thirdTextRow = isMobile ? (
    <>
      <Text {...textStyle} textTransform='uppercase' color='white'>
        Some
      </Text>
      <Text {...textStyle} textTransform='uppercase' color='white'>
        more
      </Text>
    </>
  ) : (
    <Text {...textStyle} textTransform='uppercase' color='white'>
      the future
    </Text>
  )

  return (
    <Box position='relative' mt='12px' px='16px' w='full' maxW='1420px'>
      <Box
        backgroundImage={`url(${bannerUrl})`}
        backgroundSize='100% 100%'
        height={isMobile ? '256px' : '32vw'}
        borderRadius='12px'
        mb='12px'
        position='relative'
        maxH='487px'
      >
        <HStack
          w='full'
          justifyContent={isMobile ? 'center' : 'flex-start'}
          position='absolute'
          bottom={isMobile ? '20%' : '10%'}
          left={isMobile ? 0 : '5%'}
        >
          <Button variant='white' textTransform='uppercase' fontSize='20px' p={buttonPadding}>
            start trading
          </Button>
        </HStack>
      </Box>
      <CarouselDesktop slides={desktopCards} />
    </Box>
  )
}
