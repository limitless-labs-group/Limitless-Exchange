'use client'

import { defaultChain, newSubgraphURI } from '@/constants'
import { useMarketData } from '@/hooks'
import { useToken } from '@/hooks/use-token'
import { Market } from '@/types'
import { Box, Divider, Text, Image, HStack, VStack, Spacer } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { getAddress, zeroAddress } from 'viem'

// Define the MarketPriceChart component
interface MarketPriceChartProps {
  market?: Market | null
}

export const MarketPriceChart = ({ market }: MarketPriceChartProps) => {
  /**
   * MARKET DATA
   */
  // const marketAddress = getAddress(market?.address[defaultChain.id] ?? zeroAddress)
  // const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])
  // const { outcomeTokensPercent } = useMarketData({
  //   marketAddress,
  //   collateralToken,
  // })

  console.log(market)

  const outcomeTokensPercent = market?.outcomeTokensPercent

  const pathname = usePathname()
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
      labels: {
        rotation: 0,
        align: 'right',
        style: {
          fontFamily: 'Inter',
          fontSize: '14px',
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
            [0, Highcharts.color('#2492FF').setOpacity(0.5).get('rgba')],
            //@ts-ignore
            [1, Highcharts.color('#2492FF').setOpacity(0).get('rgba')],
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
  // const flattenPriceData = (
  //   data: {
  //     timestamp: 1746075871213
  //     price: 0.9005931856451822
  //   }[]
  // ): number[][] => {
  //   if (!data || data.length === 0) {
  //     return []
  //   }
  //
  //   const flattenData: number[][] = []
  //   const oneHour = 3600000 // milliseconds in an hour
  //
  //   // Append current timestamp with the last price
  //   const lastTrade = [
  //     ...filterBrokenPrice([data[data.length - 1].timestamp, data[data.length - 1].price]),
  //   ]
  //   lastTrade[0] = Math.floor(Date.now())
  //   data.push(lastTrade)
  //
  //   for (let i = 0; i < data.length - 1; i++) {
  //     const currentTrade = filterBrokenPrice(data[i].yesBuyChartData)
  //     const nextTrade = filterBrokenPrice(data[i + 1].yesBuyChartData)
  //
  //     flattenData.push(currentTrade)
  //
  //     let currentTime = currentTrade[0]
  //     while (currentTime + oneHour < nextTrade[0]) {
  //       currentTime += oneHour
  //       flattenData.push([currentTime, currentTrade[1]])
  //     }
  //   }
  //
  //   return flattenData
  // }

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
      const points = []
      const now = Date.now()

      for (let i = 0; i < 20; i++) {
        const timestamp = now + i * 3600 * 1000 // 1-hour interval
        const price = Math.random() * 100
        points.push([timestamp, price])
      }
      return points
      // const marketId = pathname.substring(pathname.lastIndexOf('/') + 1)
      // const query = `query prices {
      //     AutomatedMarketMakerPricing(where: { market_id: { _ilike: "${marketId}" } }) {
      //       yesBuyChartData
      //     }
      // }`
      //
      // const response = await axios.post(newSubgraphURI[defaultChain.id], { query })
      // const pricingData = response.data.data?.AutomatedMarketMakerPricing as YesBuyChartData[]
      //
      // return flattenPriceData(pricingData)
    },
  })

  const initialYesChance = useMemo(() => {
    if (outcomeTokensPercent) {
      return outcomeTokensPercent[0].toFixed(2)
    }
    return '50.00'
  }, [outcomeTokensPercent])

  return (
    <Box>
      <Text fontWeight={'semibold'} color={'fontLight'} mb={1}>
        Chart
      </Text>
      <Divider orientation='horizontal' mt={1} mb={2} />
      <HStack>
        <VStack gap={-1} alignItems={'flex-start'}>
          <Text fontSize='sm' color={'fontLight'} as='b' mt={1} ml={3}>
            YES
            <br />
          </Text>
          <Text fontSize='2xl' as='b' ml={3}>
            {yesChance ? yesChance : initialYesChance}% chance
          </Text>
          <Text fontSize='sm' color={'fontLight'} ml={3}>
            {yesDate}
          </Text>
        </VStack>
        <Spacer />
        <Image mr={4} boxSize={'20%'} src='/assets/images/limitless.png' alt='Limitless Logo' />
      </HStack>
      <HighchartsReact highcharts={Highcharts} options={getChartOptions(prices)} />
    </Box>
  )
}
