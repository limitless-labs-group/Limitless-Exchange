import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import MarketPage from '@/components/common/markets/market-page'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { GroupFeedData, FeedEntity, MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

interface FeedGroupClosedProps {
  data: FeedEntity<GroupFeedData>
}

export default function FeedGroupClosed({ data }: FeedGroupClosedProps) {
  const [hovered, setHovered] = useState(false)
  const sortedMarkets = data.data.markets.sort((a, b) => b.winningIndex - a.winningIndex)
  const { market: selectedMarket, onOpenMarketPage, onCloseMarketPage } = useTradingService()
  const { trackClicked } = useAmplitude()

  const { refetch: refetchMarket } = useMarket(data.data.slug, false, false)

  const onClickRedirectToMarket = async () => {
    trackClicked(ClickEvent.FeedClosedMarketGroupClicked, {
      marketAddress: data.data.slug,
      marketType: 'group',
    })
    if (selectedMarket?.slug === data.data.slug) {
      return
    }
    const { data: fetchedMarket } = await refetchMarket()
    if (fetchedMarket) {
      onOpenMarketPage(fetchedMarket)
    }
  }

  const totalVolumeFormatted = data.data.markets?.reduce(
    (acc, b) => new BigNumber(acc).plus(b.volumeFormatted).decimalPlaces(0).toNumber(),
    0
  )

  useEffect(() => {
    return () => onCloseMarketPage()
  }, [])

  const content = (
    <Box
      w='full'
      bg={hovered ? 'grey.100' : 'unset'}
      rounded='12px'
      border='3px solid var(--chakra-colors-grey-100)'
      p='2px'
      minH='196px'
      h='full'
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        if (selectedMarket?.slug !== data.data.slug) {
          setHovered(false)
        }
      }}
      onClick={onClickRedirectToMarket}
      position='relative'
      overflow='hidden'
      cursor='pointer'
    >
      <Text {...headline} p='16px' textAlign='left'>
        {data.data.name}
      </Text>
      <VStack maxH={`92px`} p='16px' overflowY='auto' gap='16px' pt={0}>
        {sortedMarkets.map((market, index) => (
          <HStack key={index} w='full' justifyContent='space-between'>
            <Text {...paragraphRegular} color={index ? 'grey.500' : 'green.500'}>
              {market.title}
            </Text>
            <Text {...paragraphRegular} color={index ? 'grey.500' : 'green.500'}>
              {index ? '0%' : '100%'}
            </Text>
          </HStack>
        ))}
      </VStack>
      <HStack
        position='absolute'
        bg={hovered ? 'grey.100' : 'grey.50'}
        bottom={0}
        width='full'
        p='16px'
        justifyContent='space-between'
      >
        <MarketCountdown
          deadline={new Date().getTime() - 1000}
          deadlineText={new Date().toISOString()}
          color='grey.500'
          showDays={false}
          hideText={false}
          ended={true}
        />
        <HStack gap='4px'>
          <Text {...paragraphRegular} color='grey.500'>
            Volume
          </Text>
          <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
            {NumberUtil.convertWithDenomination(totalVolumeFormatted, 6)}{' '}
            {data.data.collateralToken.symbol}
          </Text>
        </HStack>
      </HStack>
    </Box>
  )

  return (
    <MarketFeedCardContainer
      user={data.user}
      eventType={data.eventType}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title='Closed market'
    >
      {isMobile ? (
        <MobileDrawer trigger={content} variant='black'>
          <MarketPage />
        </MobileDrawer>
      ) : (
        content
      )}
    </MarketFeedCardContainer>
  )
}
