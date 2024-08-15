import { MarketGroupCardResponse } from '@/types'
import Paper from '@/components/common/paper'
import { Box, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { isMobile } from 'react-device-detect'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import NextLink from 'next/link'
import React, { useState } from 'react'

interface MarketGroupCardProps {
  marketGroup: MarketGroupCardResponse
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

export const MarketGroupCard = ({ marketGroup }: MarketGroupCardProps) => {
  const [colors, setColors] = useState(defaultColors)

  const totalLiquidity = marketGroup.markets.reduce((a, b) => {
    return +a + +b.liquidityFormatted
  }, 0)

  const totalVolume = marketGroup.markets.reduce((a, b) => {
    return +a + +b.volumeFormatted
  }, 0)

  return (
    <NextLink href={`/market-group/${marketGroup.slug}`} style={{ width: '100%' }}>
      <Paper
        w={'full'}
        justifyContent={'space-between'}
        cursor='pointer'
        _hover={{ bg: 'blue.500' }}
        onMouseEnter={() => setColors(hoverColors)}
        onMouseLeave={() => setColors(defaultColors)}
      >
        <HStack justifyContent='space-between' mb='12px'>
          <Text {...paragraphMedium} color={colors.main} fontSize={'14px'} lineHeight={'20px'}>
            {marketGroup.title ?? 'Noname market'}
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
              {NumberUtil.formatThousands(totalLiquidity, 6)} {marketGroup.collateralToken.symbol}
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
              {NumberUtil.formatThousands(totalVolume, 6)} {marketGroup.collateralToken.symbol}
            </Text>
          </HStack>
        </HStack>
        <Box my='8px'>
          <Divider color='grey.400' />
        </Box>
        <VStack gap={isMobile ? '8px' : '4px'} alignItems='start'>
          {marketGroup.markets.slice(0, 3).map((market) => (
            <HStack justifyContent='space-between' key={market.address} w='full'>
              <Text {...paragraphMedium} color={colors.main}>
                {market.title}
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
          ))}
          {marketGroup.markets.length > 3 && (
            <Text {...paragraphMedium} color={colors.secondary}>
              +{marketGroup.markets.length - 3} more
            </Text>
          )}
        </VStack>
      </Paper>
    </NextLink>
  )
}
