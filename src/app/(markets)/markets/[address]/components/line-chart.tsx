'use client'

import { Box, Button, useToken, HStack, VStack, Text } from '@chakra-ui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { format, subDays, subWeeks, subMonths } from 'date-fns'
import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { isMobile } from 'react-device-detect'
import { useMarketPriceHistory } from '@/hooks/use-market-price-history'
import Logo from '@/resources/icons/limitless-logo.svg'
import { controlsMedium, headline } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface PriceChartProps {
  market: Market
}

type TimeFrame = '1D' | '1W' | '1M' | 'ALL'

export const LineChart = ({ market }: PriceChartProps) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1W')
  const timeRanges: TimeFrame[] = ['1D', '1W', '1M', 'ALL']

  const [blue500, grey100, grey300, grey500, grey50] = useToken('colors', [
    'blue.500',
    'grey.100',
    'grey.300',
    'grey.500',
    'grey.50',
  ])

  const { data: prices } = useMarketPriceHistory(market?.slug, market?.address)
  function getUniqueTimestamps() {
    const timestamps = new Set<number>()
    const now = new Date().getTime()

    const cutoffDate = (() => {
      switch (timeFrame) {
        case '1D':
          return subDays(new Date(), 1).getTime()
        case '1W':
          return subWeeks(new Date(), 1).getTime()
        case '1M':
          return subMonths(new Date(), 1).getTime()
        case 'ALL':
          return 0
        default:
          return subWeeks(new Date(), 1).getTime()
      }
    })()

    if (prices && prices.length > 0) {
      prices.forEach((pricePoint) => {
        // pricePoint is an array where the first element is the timestamp
        if (Array.isArray(pricePoint) && pricePoint[0]) {
          // Only add timestamps that are within the selected time frame
          if (pricePoint[0] >= cutoffDate || timeFrame === 'ALL') {
            timestamps.add(pricePoint[0])
          }
        }
      })
    }

    timestamps.add(now)

    return Array.from(timestamps).sort((a, b) => a - b)
  }

  const timestamps = getUniqueTimestamps()

  const formatLabel = (ts: number) => {
    const date = new Date(ts)
    if (timeFrame === '1D') {
      return format(date, 'h:mm a')
    } else {
      return format(date, 'MMM d')
    }
  }

  const data: ChartData<'line'> = {
    labels: timestamps.map(formatLabel),
    datasets:
      prices && prices.length > 0
        ? [
            {
              label: 'Yes',
              data: timestamps.map((ts) => {
                // Find exact match for this timestamp
                const exactMatch = prices.find((p) => Array.isArray(p) && p[0] === ts)
                if (exactMatch) {
                  return +exactMatch[1] // The second element is the value
                }

                // Find the most recent price before this timestamp
                const previousPrices = prices.filter((p) => Array.isArray(p) && p[0] <= ts)
                if (previousPrices.length > 0) {
                  const mostRecent = previousPrices.reduce((a, b) => (a[0] > b[0] ? a : b))
                  return +mostRecent[1] // The second element is the value
                }

                // If no previous prices, use the first price
                if (prices.length > 0 && Array.isArray(prices[0])) {
                  return +prices[0][1] // The second element is the value
                }

                return null
              }),
              borderColor: blue500,
              backgroundColor: blue500,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
              tension: 0.4,
              cubicInterpolationMode: 'monotone',
              spanGaps: true,
              segment: {
                borderColor: (ctx: any) => {
                  if (!ctx.p0.parsed) return
                  if (ctx.p0.parsed.x >= ctx.chart.hoverIndex) {
                    return grey300
                  }
                },
              },
            },
          ]
        : [], // Empty array if no prices data
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    onHover: (event: any, elements: any, chart: any) => {
      if (elements && elements.length) {
        const dataIndex = elements[0].index
        chart.hoverIndex = dataIndex
        chart.update('none')
      } else {
        chart.hoverIndex = undefined
        chart.update('none')
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 6,
          boxHeight: 6,
          padding: 12,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets
            return datasets.map((dataset, i) => ({
              text: dataset.label || '',
              fillStyle: dataset.borderColor as string,
              strokeStyle: dataset.borderColor as string,
              lineWidth: 0,
              hidden: !chart.isDatasetVisible(i),
              index: i,
              fontColor: dataset.borderColor as string,
            }))
          },
          font: {
            family: 'Inter, sans-serif',
            size: 14,
            weight: 400,
          },
        },
      },
      tooltip: {
        backgroundColor: grey50,
        borderColor: grey300,
        borderWidth: 1,
        boxWidth: 5,
        boxHeight: 5,
        titleColor: grey500,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 12,
        },
        bodyColor: grey500,
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 14,
        },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            const date = new Date(timestamps[items[0].dataIndex])
            return format(date, 'MMM d, yyyy h:mm a')
          },
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${value.toFixed(2)}%`
          },
        },
      },
      // @ts-ignore
      verticalLine: {
        beforeDraw: (chart: any) => {
          if (chart.tooltip._active && chart.tooltip._active.length) {
            const activePoint = chart.tooltip._active[0]
            const ctx = chart.ctx
            const x = activePoint.element.x
            const topY = chart.scales.y.top
            const bottomY = chart.scales.y.bottom

            // Save context state
            ctx.save()

            // Draw vertical line
            ctx.beginPath()
            ctx.setLineDash([5, 5]) // Create dashed line
            ctx.moveTo(x, topY)
            ctx.lineTo(x, bottomY)
            ctx.lineWidth = 1
            ctx.strokeStyle = grey300
            ctx.stroke()

            // Restore context state
            ctx.restore()
          }
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          color: grey300,
        },
        // Reduce the number of ticks to make the chart smoother
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 20,
          color: grey500,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          autoSkip: true,
          maxTicksLimit: 6,
        },
        // This section is now handled in the replacement above
      },
      y: {
        position: 'right',
        min: 0,
        max: 100,
        border: {
          display: false,
        },
        grid: {
          color: grey100,
          lineWidth: 1,
          tickBorderDash: [6, 6],
          tickLength: 0,
          drawTicks: false,
        },
        ticks: {
          color: grey500,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          stepSize: 25,
          autoSkip: false,
          padding: 10,
          callback: (value) => {
            const values = [0, 25, 50, 75, 100]
            return values.includes(+value) ? `${value}%` : ''
          },
        },
      },
    },
  }

  const verticalLinePlugin = {
    id: 'verticalLine',
    beforeDraw: (chart: any) => {
      const options = chart.config.options.plugins.verticalLine
      if (options && options.beforeDraw) {
        options.beforeDraw(chart)
      }
    },
  }

  ChartJS.register(verticalLinePlugin)

  return (
    <VStack w='full' spacing='24px' align='stretch' borderRadius='12px' gap={0}>
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
              bg={range === timeFrame ? 'grey.50' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor: range === timeFrame ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
              }}
              _disabled={{
                opacity: '50%',
                pointerEvents: 'none',
              }}
              onClick={() => {
                setTimeFrame(range)
              }}
              key={range}
            >
              <Text {...controlsMedium} color={range === timeFrame ? 'font' : 'fontLight'}>
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

      <Box borderRadius='12px' bg='grey.50' p='8px' height='214px' width='100%' position='relative'>
        <Line
          data={data}
          options={{
            ...options,
            maintainAspectRatio: false,
            responsive: true,
          }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        />
      </Box>
    </VStack>
  )
}
