import { defaultChain } from '@/constants'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Box, HStack, StackProps, Text } from '@chakra-ui/react'
import Paper from '@/components/common/paper'
import { useState } from 'react'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import NextLink from 'next/link'

interface IMarketCard extends StackProps {
  market: Market
}

const unhoveredColors = {
  main: 'grey.800',
  secondary: 'grey.500',
}

const hoverColors = {
  main: 'white',
  secondary: 'transparent.700',
}

export const MarketCard = ({ market, ...props }: IMarketCard) => {
  const [colors, setColors] = useState(unhoveredColors)

  return (
    <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
      <Paper
        w={'full'}
        justifyContent={'space-between'}
        cursor='pointer'
        _hover={{ bg: 'blue.500' }}
        onMouseEnter={() => setColors(hoverColors)}
        onMouseLeave={() => setColors(unhoveredColors)}
        {...props}
      >
        <HStack justifyContent='space-between' mb='12px'>
          <Text {...paragraphMedium} color={colors.main} fontSize={'14px'} lineHeight={'20px'}>
            {market?.proxyTitle ?? market?.title ?? 'Noname market'}
          </Text>
          <HStack gap={1} color={colors.main}>
            <ThumbsUpIcon width={'16px'} height={'16px'} />
            <Text {...paragraphMedium} color={colors.main} fontSize={'14px'} lineHeight={'20px'}>
              {market?.prices[0]}% YES
            </Text>
            <ArrowRightIcon width={'16px'} height={'16px'} />
          </HStack>
        </HStack>
        <HStack justifyContent='space-between' alignItems='flex-end'>
          <HStack gap='24px'>
            <Box>
              <HStack gap={1} color={colors.secondary}>
                <LiquidityIcon width={16} height={16} />
                <Text {...paragraphMedium} color={colors.secondary}>
                  Liquidity
                </Text>
              </HStack>
              <Text mt={1} {...paragraphRegular} color={colors.main}>
                {NumberUtil.formatThousands(market?.liquidityFormatted, 4)}{' '}
                {market?.collateralToken.symbol}
              </Text>
            </Box>
            <Box>
              <HStack gap={1} color={colors.secondary}>
                <VolumeIcon width={16} height={16} />
                <Text {...paragraphMedium} color={colors.secondary}>
                  Volume
                </Text>
              </HStack>
              <Text mt={1} {...paragraphRegular} color={colors.main}>
                {NumberUtil.formatThousands(market?.volumeFormatted, 4)}{' '}
                {market?.collateralToken.symbol}
              </Text>
            </Box>
          </HStack>
          <HStack gap={1} color={colors.secondary}>
            <CalendarIcon width={'16px'} height={'16px'} />
            <Text {...paragraphRegular} color={colors.secondary}>
              {market?.expirationDate}
            </Text>
          </HStack>
        </HStack>
      </Paper>
    </NextLink>
  )
}
