'use client'

import { Box, HStack, Button, Text, VStack } from '@chakra-ui/react'
import { memo, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Skeleton from '@/components/common/skeleton'
import { PriceChart } from '@/app/(markets)/markets/[address]/components/area-chart'
import { useClobPriceHistory } from '@/hooks/use-market-price-history'
import Logo from '@/resources/icons/limitless-logo.svg'
import { controlsMedium, headline, paragraphMedium } from '@/styles/fonts/fonts.styles'

type TimeRange = '1H' | '6H' | '1D' | '1W' | '1M' | 'ALL'

type PriceChartContainerProps = {
  slug?: string
  marketType?: 'single' | 'group'
  ended: boolean
  showBorders?: boolean
}

const ChartContainer = ({
  slug,
  marketType,
  ended,
  showBorders = true,
}: PriceChartContainerProps) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('ALL')
  const timeRanges: TimeRange[] = ['1H', '6H', '1D', '1W', '1M', 'ALL']

  const { data: priceHistory, isLoading: isLoadingPriceHistory } = useClobPriceHistory(
    selectedRange,
    slug,
    marketType
  )

  const getFilteredData = (data: Array<{ timestamp: number; price: number }>) => {
    if (!data || data.length === 0) return []

    const now = Date.now()
    const ranges = {
      '1H': now - 60 * 60 * 1000,
      '6H': now - 6 * 60 * 60 * 1000,
      '1D': now - 24 * 60 * 60 * 1000,
      '1W': now - 7 * 24 * 60 * 60 * 1000,
      '1M': now - 30 * 24 * 60 * 60 * 1000,
      ALL: 0,
    }

    return data.filter((point) => +point.timestamp >= ranges[selectedRange])
  }

  const filteredHistories = priceHistory?.map((history) => ({
    ...history,
    prices: getFilteredData(history.prices).reverse(),
  }))

  useEffect(() => {
    setSelectedRange('ALL')
  }, [slug])

  return (
    <VStack
      w='full'
      spacing='24px'
      align='stretch'
      border={showBorders ? '3px solid' : 'unset'}
      borderRadius='12px'
      borderColor='grey.100'
      gap={0}
      mt='20px'
    >
      <HStack
        mt='20px'
        justifyContent='space-between'
        px='8px'
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'center'}
      >
        <HStack
          bg='grey.200'
          borderRadius='8px'
          py='2px'
          px={'2px'}
          w={isMobile ? 'full' : 'unset'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {timeRanges.map((range) => (
            <Button
              h={isMobile ? '28px' : '20px'}
              flex='1'
              borderRadius='6px'
              py='2px'
              px='12px'
              bg={range === selectedRange ? 'grey.50' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor: range === selectedRange ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
              }}
              _disabled={{
                opacity: '50%',
                pointerEvents: 'none',
              }}
              onClick={() => {
                setSelectedRange(range)
              }}
              disabled={ended}
              key={range}
            >
              <Text {...controlsMedium} color={range === selectedRange ? 'font' : 'fontLight'}>
                {range}
              </Text>
            </Button>
          ))}
        </HStack>
        <HStack gap='4px' color='grey.500'>
          <Logo />
          <Text {...headline} color='grey.500'>
            Limitless
          </Text>
        </HStack>
      </HStack>
      <Box borderRadius='12px' bg='grey.50' p='8px'>
        {isLoadingPriceHistory || !filteredHistories ? (
          <Box>
            <Skeleton height={240} />
          </Box>
        ) : Boolean(filteredHistories?.[0].prices.length) ? (
          <PriceChart history={filteredHistories} />
        ) : (
          <HStack w='full' h='240px' justifyContent='center'>
            <Text {...paragraphMedium}>No history within requested range</Text>
          </HStack>
        )}
      </Box>
    </VStack>
  )
}

export const PriceChartContainer = memo(ChartContainer)
