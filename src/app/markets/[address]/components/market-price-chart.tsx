'use client'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { defaultChain, newSubgraphURI } from '@/constants'
import { usePathname } from 'next/navigation'
import { Text, HStack, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Market } from '@/types'
import Paper from '@/components/common/paper'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import { isMobile } from 'react-device-detect'
import { useThemeProvider } from '@/providers'
import { getAddress } from 'viem'

const ONE_HOUR = 3_600_000 // milliseconds in an hour

// Define the interface for the chart data
interface YesBuyChartData {
  yesBuyChartData: [number, number]
}

// Define the MarketPriceChart component
export interface IMarketPriceChart {
  marketAddr: string
  winningIndex: number | undefined | null
  resolved: boolean
  outcomeTokensPercent?: number[]
}

export const MarketPriceChart = ({
  marketAddr,
  resolved,
  winningIndex,
  outcomeTokensPercent,
}: IMarketPriceChart) => {
  const pathname = usePathname()
  const { colors } = useThemeProvider()
  const [yesChance, setYesChance] = useState('')
  const [yesDate, setYesDate] = useState(
    Highcharts.dateFormat('%B %e, %Y %I:%M %p', Date.now()) ?? ''
  )

  // Function to generate chart options
  const getChartOptions = (data: number[][] | undefined): Highcharts.Options => ({
    chart: {
      zooming: {
        type: 'x',
      },
      height: 230,
      backgroundColor: colors.grey['200'],
      marginLeft: 0,
      marginRight: 0,
    },
    title: {
      text: undefined,
    },
    //@ts-ignore
    xAxis: {
      type: 'datetime',
      ordinal: false,
      tickInterval: 24 * 3600 * 1000 * 10,
      tickPosition: 'outside',
      lineColor: colors.grey['800'],
      tickColor: colors.grey['800'],
      labels: {
        x: isMobile ? 20 : 10,
        step: isMobile ? 3 : 0,
        rotation: 0,
        align: 'center',
        style: {
          fontFamily: 'Helvetica Neue',
          fontSize: isMobile ? '14px' : '12px',
          color: colors.grey['800'],
        },
        formatter: function () {
          return Highcharts.dateFormat('%b %e', Number(this.value))
        },
      },
    },
    yAxis: {
      title: {
        text: null,
      },
      min: 0,
      max: 100,
      opposite: true,
      tickInterval: 20,
      gridLineColor: colors.grey['400'],
    },
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      formatter: function () {
        return `YES: <b>${Number(this.y).toFixed(2)}%</b>`
      },
    },
    plotOptions: {
      series: {
        lineWidth: 4,
        marker: {
          enabled: false,
        },
        point: {
          events: {
            mouseOver: function () {
              //@ts-ignore
              setYesDate(Highcharts.dateFormat('%B %e, %Y %I:%M %p', Number(this.x)))
              //@ts-ignore
              setYesChance(this.y.toFixed(2))
            },
          },
        },
      },
      area: {
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            //@ts-ignore
            [0, Highcharts.color(colors.green['500']).setOpacity(0.5).get('rgba')],
            //@ts-ignore
            [1, Highcharts.color(colors.green['500']).setOpacity(0).get('rgba')],
          ],
          brighten: 0.2,
        },
        marker: {
          radius: 2,
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1,
          },
        },
        threshold: null,
      },
    },
    series: [
      {
        type: 'area',
        name: 'Price',
        data: data,
        turboThreshold: 2000,
        boostThreshold: 2000,
        color: colors.green['500'],
        lineWidth: 2,
      },
    ],
  })

  /**
   * Flattens and interpolates price data for a chart.
   *
   * This function takes an array of YesBuyChartData objects, interpolates missing
   * hourly data points, and converts prices to percentages. The function appends
   * the current timestamp with the last price in the data array to ensure the
   * latest data point is included.
   *
   * @param {YesBuyChartData[]} data - The array of YesBuyChartData objects.
   * @returns {number[][]} - A 2D array of flattened and interpolated price data,
   *                         where each sub-array contains a timestamp and a price percentage.
   */
  const flattenPriceData = (data: YesBuyChartData[]): number[][] => {
    if (!data || data.length === 0) {
      return []
    }

    const flattenData: number[][] = []

    // Append current timestamp with the last price
    const lastTrade = [...filterBrokenPrice(data[data.length - 1].yesBuyChartData)]
    lastTrade[0] = Math.floor(Date.now())
    data.push({ yesBuyChartData: lastTrade as [number, number] })

    for (let i = 0; i < data.length - 1; i++) {
      const currentTrade = filterBrokenPrice(data[i].yesBuyChartData)
      const nextTrade = filterBrokenPrice(data[i + 1].yesBuyChartData)

      flattenData.push(currentTrade)

      let currentTime = currentTrade[0]
      while (currentTime + ONE_HOUR < nextTrade[0]) {
        currentTime += ONE_HOUR
        flattenData.push([currentTime, currentTrade[1]])
      }
    }

    return flattenData
  }

  /**
   * Sometimes indexer returns the first price as NaN
   *
   * @param nums
   */
  const filterBrokenPrice = (nums: [number, number]) => {
    nums[0] = isNaN(nums[0]) ? 0 : nums[0]
    nums[1] = isNaN(nums[1]) ? Number(yesChance) : nums[1]
    return nums
  }

  // React Query to fetch the price data
  const { data: prices } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const marketId = pathname.substring(pathname.lastIndexOf('/') + 1)
      const query = `query prices {
          AutomatedMarketMakerPricing(where: { market_id: { _ilike: "${marketId}" } }) {
            yesBuyChartData
          }
      }`

      const response = await axios.post(newSubgraphURI[defaultChain.id], { query })
      const pricingData = response.data.data?.AutomatedMarketMakerPricing as YesBuyChartData[]

      return flattenPriceData(pricingData)
    },
  })

  // const initialYesChance = useMemo(() => {
  //   if (market?.prices) {
  //     return market.prices[0].toFixed(2)
  //   }
  //   return '50.00'
  // }, [market?.prices])

  const chartData = useMemo(() => {
    const _prices: number[][] = prices ?? []
    const data = resolved
      ? [
          ...(_prices ?? []),
          !!_prices[_prices.length - 1]
            ? [_prices[_prices.length - 1][0] + ONE_HOUR, winningIndex === 0 ? 100 : 0]
            : [Date.now(), 100],
        ].filter((priceData) => {
          const [, value] = priceData
          return !!value
        })
      : _prices

    // special case hotfix
    const special = {
      [getAddress('0xD0BC7FCea7500d485329e0aaE36e0512815684BF')]: {
        index: 0,
        timestamp: 1722745928000, // aug 4 2024
        exists: true,
      },
    }
    if (special[getAddress(marketAddr)]?.exists) {
      const _index = special[getAddress(marketAddr)].index

      if (data[_index]) {
        data[_index][0] = special[getAddress(marketAddr)].timestamp

        for (let index = 0; index < Array.from({ length: 10 }).length; index++) {
          data.splice(index + 1, 0, [data[index][0] + ONE_HOUR, data[index][1]])
        }
      }
    }

    return data
  }, [prices, winningIndex, resolved])

  useEffect(() => {
    if (chartData) console.log('chartData', chartData)
  }, [chartData])

  return (
    <Paper my='24px' p='8px'>
      <HStack gap={'4px'} color='green.500'>
        <ThumbsUpIcon width={16} height={16} />
        <Text fontWeight={500}>
          {!resolved ? outcomeTokensPercent?.[0] : winningIndex === 0 ? 100 : 0}%
        </Text>
        <Text fontWeight={500}>Yes</Text>
        {/*<ChevronDownIcon width={16} height={16} />*/}
      </HStack>
      <HStack>
        <VStack gap={-1} alignItems={'flex-start'}>
          <Text fontSize='sm' color={'fontLight'}>
            {yesDate}
          </Text>
        </VStack>
      </HStack>
      <HighchartsReact highcharts={Highcharts} options={getChartOptions(chartData)} />
    </Paper>
  )
}
