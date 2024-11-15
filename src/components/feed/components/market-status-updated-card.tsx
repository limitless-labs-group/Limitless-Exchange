import { Box, HStack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import Paper from '@/components/common/paper'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { FeedEventType, FeedEntity, MarketStatusFeedData, Market } from '@/types'
import { NumberUtil } from '@/utils'

interface MarketStatusUpdatedCardProps {
  data: FeedEntity<MarketStatusFeedData>
}

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}

const hoverColors = {
  main: 'var(--chakra-colors-white)',
  secondary: 'var(--chakra-colors-transparent-700)',
  chartBg: 'var(--chakra-colors-transparent-300)',
}

export default function MarketStatusUpdatedCard({ data }: MarketStatusUpdatedCardProps) {
  const [colors, setColors] = useState(defaultColors)

  const { onOpenMarketPage } = useTradingService()

  const getText = () => {
    switch (data.eventType) {
      case FeedEventType.Locked:
        return 'Locked'
      case FeedEventType.Resolved:
        return 'Closed'
      default:
        return 'Created'
    }
  }

  const { data: market } = useMarket(data.data.address)

  const content = (
    <Paper
      w={'full'}
      justifyContent={'space-between'}
      cursor='pointer'
      {...(isMobile
        ? {}
        : {
            _hover: { bg: 'blue.500' },
          })}
      onMouseEnter={() => setColors(hoverColors)}
      onMouseLeave={() => setColors(defaultColors)}
      onClick={() => onOpenMarketPage(market as Market, 'Feed')}
      rounded='8px'
    >
      <HStack justifyContent='space-between' mb='12px'>
        <Text {...paragraphMedium} color={colors.main} fontSize={'14px'} lineHeight={'20px'}>
          {data.data.name}
        </Text>
        <HStack gap={1} color={colors.main}>
          {market?.prices ? (
            <>
              <Text {...paragraphMedium} color={colors.main}>
                {market.prices[0]}%
              </Text>
              <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
                <Box
                  h='100%'
                  w='100%'
                  borderRadius='100%'
                  bg={`conic-gradient(${colors.main} ${market.prices[0]}% 10%, ${colors.chartBg} ${market.prices[0]}% 100%)`}
                />
              </Box>
            </>
          ) : null}
        </HStack>
      </HStack>
      <HStack
        gap={isMobile ? '8px' : '16px'}
        mt={isMobile ? '16px' : '8px'}
        flexDirection={isMobile ? 'column' : 'row'}
      >
        <HStack
          w={isMobile ? '100%' : 'unset'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
        >
          <HStack color={colors.secondary} gap='4px'>
            <LiquidityIcon width={16} height={16} />
            <Text {...paragraphMedium} color={colors.secondary}>
              Liquidity
            </Text>
          </HStack>
          <Text {...paragraphRegular} color={colors.main}>
            {NumberUtil.formatThousands(data.data.liquidityFormatted, 6)}{' '}
            {data.data.collateralToken.symbol}
          </Text>
        </HStack>
        <HStack
          w={isMobile ? '100%' : 'unset'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
        >
          <HStack color={colors.secondary} gap='4px'>
            <VolumeIcon width={16} height={16} />
            <Text {...paragraphMedium} color={colors.secondary}>
              Volume
            </Text>
          </HStack>
          <Text {...paragraphRegular} color={colors.main}>
            {NumberUtil.formatThousands(data.data.volumeFormatted, 6)}{' '}
            {data.data.collateralToken.symbol}
          </Text>
        </HStack>
      </HStack>
    </Paper>
  )

  return (
    <MarketFeedCardContainer
      user={data.user}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={`${getText()} market`}
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
