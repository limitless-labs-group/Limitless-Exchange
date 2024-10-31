import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { SyntheticEvent, useState } from 'react'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import Paper from '@/components/common/paper'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import TooltipIcon from '@/resources/icons/tooltip-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { captionMedium, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

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

interface DailyMarketCardProps {
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

export default function DailyMarketCard({ market, analyticParams }: DailyMarketCardProps) {
  const [colors, setColors] = useState(defaultColors)
  const [hovered, setHovered] = useState(false)
  const { onOpenMarketPage } = useTradingService()
  const router = useRouter()

  const isLumy = market.title.includes('COIN')

  const { trackClicked } = useAmplitude()

  const handleLumyButtonClicked = (e: SyntheticEvent) => {
    e.stopPropagation()
    router.push('/lumy')
  }

  return (
    <Box borderRadius='2px' overflow='hidden'>
      <Paper
        flex={1}
        h={'160px'}
        w={'100%'}
        _hover={{
          bg: isLumy
            ? 'linear-gradient(90deg, #5F1BEC 0%, #FF3756 27.04%, #FFCB00 99.11%)'
            : 'blue.500',
          borderColor: 'blue.500',
        }}
        onMouseEnter={() => {
          setColors(hoverColors)
          setHovered(true)
        }}
        onMouseLeave={() => {
          setColors(defaultColors)
          setHovered(false)
        }}
        onClick={() => {
          trackClicked(ClickEvent.MediumMarketBannerClicked, {
            ...analyticParams,
          })
          onOpenMarketPage(market, 'Medium Banner')
        }}
        position='relative'
        cursor='pointer'
        p='6px'
        border='2px solid'
        borderColor={'grey.200'}
        style={{
          borderImage: isLumy
            ? 'linear-gradient(90deg, #5F1BEC 0%, #FF3756 27.04%, #FFCB00 99.11%) 1'
            : 'unset',
        }}
      >
        <Flex h='full' flexDirection='column' justifyContent='space-between'>
          <HStack justifyContent='space-between'>
            <HStack gap='4px' color={colors.main}>
              <LiquidityIcon width={16} height={16} />
              <Text {...paragraphMedium} color={colors.main}>
                {NumberUtil.convertWithDenomination(market.liquidityFormatted, 6)}{' '}
                {market.collateralToken.symbol}
              </Text>
            </HStack>
            <HStack gap='4px' color={colors.main}>
              <VolumeIcon width={16} height={16} />
              <Text {...paragraphMedium} color={colors.main}>
                {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
                {market.collateralToken.symbol}
              </Text>
            </HStack>
          </HStack>
          <Flex w='full' justifyContent='center'>
            <Text {...paragraphMedium} maxW='80%' textAlign='center' color={colors.main}>
              {market.proxyTitle ?? market.title ?? 'Noname market'}
            </Text>
          </Flex>
          <HStack justifyContent='space-between'>
            <DailyMarketTimer deadline={market.expirationTimestamp} color={colors.main} />
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
        </Flex>
        {isLumy && (
          <Box
            position='absolute'
            bottom={0}
            left='calc(50% - 30px)'
            py='2px'
            px='4px'
            borderTopLeftRadius='4px'
            borderTopRightRadius='2px'
            bg={hovered ? 'unset' : 'linear-gradient(90deg, #FF444F -14%, #FF7A30 100%)'}
            onClick={handleLumyButtonClicked}
          >
            <HStack gap='8px' color='grey.white'>
              <Text {...captionMedium} color='grey.white'>
                LUMY AI
              </Text>
              <TooltipIcon width={16} height={16} />
            </HStack>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
