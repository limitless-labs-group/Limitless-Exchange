import { Box, HStack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import Paper from '@/components/common/paper'
import { MarketCardLink } from './market-card-link'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { useTradingService } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface MarketSingleCardProps {
  market: Market
  markets?: Market[]
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

export const MarketSingleCard = ({ market, markets }: MarketSingleCardProps) => {
  const [colors, setColors] = useState(defaultColors)
  const router = useRouter()
  const { onOpenMarketPage, onCloseMarketPage, setMarkets } = useTradingService()

  const trackMarketClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }

    if (!isMobile) {
      e.preventDefault()
    }
    router.push(`?market=${market.address}`, { scroll: false })
    onOpenMarketPage(market, 'Standard Banner')
    if (isMobile) {
      setMarkets(markets as Market[])
    }
  }

  const content = (
    <Paper
      w={'full'}
      justifyContent={'space-between'}
      _hover={{ ...(!isMobile ? { bg: 'blue.500' } : {}) }}
      onMouseEnter={() => {
        if (!isMobile) {
          setColors(hoverColors)
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setColors(defaultColors)
        }
      }}
      onClick={(e) => trackMarketClicked(e)}
      position='relative'
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
              {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
              {market.collateralToken.symbol}
            </Text>
          </HStack>
        </HStack>
      </HStack>
    </Paper>
  )

  return isMobile ? (
    <MobileDrawer id={market.address} trigger={content} variant='black' onClose={onCloseMarketPage}>
      <MarketPage />
    </MobileDrawer>
  ) : (
    <MarketCardLink marketAddress={market.address}>{content}</MarketCardLink>
  )
}
