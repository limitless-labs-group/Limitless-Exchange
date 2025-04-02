'use client'

import { Box, HStack, Button, Text, VStack } from '@chakra-ui/react'
import { memo, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Skeleton from '@/components/common/skeleton'
import { PriceChart } from '@/app/(markets)/markets/[address]/components/area-chart'
import { useNegRiskPriceHistory } from '@/hooks/use-market-price-history'
import Logo from '@/resources/icons/limitless-logo.svg'
import { useTradingService } from '@/services'
import { controlsMedium, headline } from '@/styles/fonts/fonts.styles'

type TimeRange = '1H' | '6H' | '1D' | '1W' | '1M' | 'ALL'

const ChartContainer = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1D')
  const timeRanges: TimeRange[] = ['1H', '6H', '1D', '1W', '1M', 'ALL']

  const { groupMarket } = useTradingService()

  const marketSlug = useMemo(() => {
    return groupMarket?.slug
  }, [groupMarket?.slug])

  const { data: priceHistory, isLoading: isLoadingPriceHistory } =
    useNegRiskPriceHistory(marketSlug)

  if (!priceHistory || isLoadingPriceHistory) {
    return (
      <Box w='full'>
        <Skeleton height={240} />
      </Box>
    )
  }

  // Filter data for all histories based on selected time range
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

    return data.filter((point) => point.timestamp >= ranges[selectedRange])
  }

  const filteredHistories = priceHistory?.map((history) => ({
    ...history,
    prices: getFilteredData(history.prices),
  }))

  return (
    <VStack
      w='full'
      spacing='24px'
      align='stretch'
      border='3px solid'
      borderRadius='12px'
      borderColor='grey.100'
      gap={0}
    >
      <HStack
        mt='20px'
        justifyContent='space-between'
        px='16px'
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'center'}
      >
        <HStack
          bg='grey.200'
          borderRadius='8px'
          py='2px'
          px={'2px'}
          w={isMobile ? 'full' : 'unset'}
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
        <PriceChart history={filteredHistories} />
      </Box>
    </VStack>
  )
}

export const PriceChartContainer = memo(ChartContainer)
