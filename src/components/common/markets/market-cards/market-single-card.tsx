import VolumeIcon from '@/resources/icons/volume-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { MarketSingleCardResponse } from '@/types'
import { NumberUtil } from '@/utils'
import { Box, HStack, Text } from '@chakra-ui/react'
import Paper from '@/components/common/paper'
import React, { useState } from 'react'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import { OpenEvent, PageOpenedMetadata, useAmplitude } from '@/services'

interface MarketSingleCardProps {
  market: MarketSingleCardResponse
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

export const MarketSingleCard = ({ market }: MarketSingleCardProps) => {
  const [colors, setColors] = useState(defaultColors)
  const { trackOpened } = useAmplitude()

  const trackMarketClicked = () => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Market Page',
      market: market.address,
      marketType: 'single',
    })
  }

  return (
    <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
      <Paper
        w={'full'}
        justifyContent={'space-between'}
        cursor='pointer'
        _hover={{ ...(!isMobile ? { bg: 'blue.500' } : {}) }}
        onMouseEnter={() => !isMobile && setColors(hoverColors)}
        onMouseLeave={() => !isMobile && setColors(defaultColors)}
        onClick={trackMarketClicked}
      >
        <HStack justifyContent='space-between' mb='12px' alignItems='flex-start'>
          <Text {...paragraphMedium} color={colors.main}>
            {market.proxyTitle ?? market.title ?? 'Noname market'}
          </Text>
          <HStack gap={1} color={colors.main}>
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
          </HStack>
        </HStack>
        <HStack
          justifyContent='space-between'
          alignItems='flex-end'
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <HStack
            gap={isMobile ? '8px' : '16px'}
            mt={isMobile ? '16px' : '8px'}
            flexDirection={isMobile ? 'column' : 'row'}
            w='full'
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
                {NumberUtil.formatThousands(market.liquidityFormatted, 6) +
                  ' ' +
                  market.collateralToken.symbol}
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
                {NumberUtil.formatThousands(market.volumeFormatted, 6)}{' '}
                {market.collateralToken.symbol}
              </Text>
            </HStack>
          </HStack>
        </HStack>
      </Paper>
    </NextLink>
  )
}
