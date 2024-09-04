import { FeedEntity, FeedEventType, MarketGroupStatusFeedData } from '@/types'
import React, { useState } from 'react'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import { Box, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import BigNumber from 'bignumber.js'

interface GroupStatusUpdatedCard {
  data: FeedEntity<MarketGroupStatusFeedData>
}

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
  divider: 'var(--chakra-colors-grey-400)',
}

const hoverColors = {
  main: 'var(--chakra-colors-white)',
  secondary: 'var(--chakra-colors-transparent-700)',
  chartBg: 'var(--chakra-colors-transparent-300)',
  divider: 'var(--chakra-colors-transparent-300)',
}

export default function GroupStatusUpdatedCard({ data }: GroupStatusUpdatedCard) {
  const [colors, setColors] = useState(defaultColors)
  const getText = () => {
    switch (data.eventType) {
      case FeedEventType.LockedGroup:
        return 'Locked'
      case FeedEventType.ResolvedGroup:
        return 'Closed'
      default:
        return 'Created'
    }
  }

  const totalLiquidity = data.data.markets.reduce(
    (a, b) => new BigNumber(a).plus(new BigNumber(b.liquidityFormatted)).toNumber(),
    0
  )

  const totalVolume = data.data.markets.reduce(
    (a, b) => new BigNumber(a).plus(new BigNumber(b.volumeFormatted)).toNumber(),
    0
  )

  return (
    <MarketFeedCardContainer
      creator={data.user}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={`${getText()} market group`}
    >
      <NextLink href={`/market-group/${data.data.slug}`} style={{ width: '100%' }}>
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
        >
          <HStack justifyContent='space-between' mb='12px'>
            <Text {...paragraphMedium} color={colors.main} lineHeight={'20px'}>
              {data.data.name}
            </Text>
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
                {NumberUtil.formatThousands(totalLiquidity, 6)} {data.data.collateralToken.symbol}
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
                {NumberUtil.formatThousands(totalVolume, 6)} {data.data.collateralToken.symbol}
              </Text>
            </HStack>
          </HStack>
          <Box my='8px'>
            <Divider color={colors.divider} />
          </Box>
          <VStack gap={isMobile ? '8px' : '4px'} alignItems='start'>
            {data.data.markets.slice(0, 3).map((market) => (
              <HStack justifyContent='space-between' key={market.address} w='full'>
                <Text {...paragraphMedium} color={colors.main}>
                  {market.title}
                </Text>
                {/*<HStack gap={1} color={colors.main}>*/}
                {/*  <Text {...paragraphMedium} color={colors.main}>*/}
                {/*    {market.prices[0]}%*/}
                {/*  </Text>*/}
                {/*  <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>*/}
                {/*    <Box*/}
                {/*      h='100%'*/}
                {/*      w='100%'*/}
                {/*      borderRadius='100%'*/}
                {/*      bg={`conic-gradient(${colors.main} ${market.prices[0]}% 10%, ${colors.chartBg} ${market.prices[0]}% 100%)`}*/}
                {/*    />*/}
                {/*  </Box>*/}
                {/*</HStack>*/}
              </HStack>
            ))}
            {data.data.markets.length > 3 && (
              <Text {...paragraphMedium} color={colors.secondary}>
                +{data.data.markets.length - 3} more
              </Text>
            )}
          </VStack>
        </Paper>
      </NextLink>
    </MarketFeedCardContainer>
  )
}
