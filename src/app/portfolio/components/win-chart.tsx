'use client'

import { Box, useToken } from '@chakra-ui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartData,
  ChartOptions,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { format } from 'date-fns'
import React from 'react'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, annotationPlugin)
interface ChartDataPoint {
  datetime: number
  current_trader: boolean
  outcome_price: string
  outcome: string
  margin: string
}

export interface ChartDataResponse {
  bestBuy: ChartDataPoint
  bestBuyIndex: number
  boughtProbability: number
  outcome: string
  data: ChartDataPoint[]
}

interface PriceChartProps {
  chartData: ChartDataResponse
  customLabel?: React.ReactNode
}

export const WinChart = ({ chartData }: PriceChartProps) => {
  const [green500, white, black] = useToken('colors', ['green.500', 'white', 'black'])

  const timestamps = chartData?.data?.map((point) => point.datetime) || []

  const bestBuyPosition = chartData?.bestBuy
    ? {
        timestamp: chartData.bestBuy.datetime,
        price: parseFloat(chartData.bestBuy.outcome_price) * 100,
      }
    : null

  const formatLabel = (ts: number) => format(new Date(ts), 'MMM d')

  const data: ChartData<'line'> = {
    labels: timestamps.map(formatLabel),
    datasets: [
      {
        data: chartData?.data?.map((point) => parseFloat(point.outcome_price) * 100) || [],
        borderColor: green500,
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 2,
        cubicInterpolationMode: 'monotone',
        spanGaps: true,
      },
      {
        data:
          chartData?.data?.map((point) =>
            point.datetime === bestBuyPosition?.timestamp ? bestBuyPosition.price : null
          ) || [],
        borderColor: green500,
        backgroundColor: black,
        pointRadius: 5,
        pointHoverRadius: 5,
        borderWidth: 2,
        pointStyle: 'circle',
        showLine: false,
        order: 0,
        animation: false,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      annotation: {
        annotations: {
          buyLabel: {
            type: 'label',
            xValue: bestBuyPosition
              ? chartData?.data?.findIndex((point) => point.datetime === bestBuyPosition.timestamp)
              : -1,
            yValue: bestBuyPosition ? bestBuyPosition.price : 0,
            backgroundColor: 'transparent',
            color: green500,
            content: 'Bought',
            font: {
              size: 12,
              weight: 'bold',
            },
            padding: {
              top: 5,
              bottom: 5,
              left: 5,
              right: 5,
            },
            borderWidth: 0,
            display: !!bestBuyPosition,
            position: 'start',
            yAdjust: -15,
            xAdjust: 5,
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        min: 0,
        max: 100,
        grid: {
          display: false,
        },
      },
    },
    // elements: {
    //   line: {
    //     borderWidth: 2,
    //     tension: 0, // Remove line tension to avoid animations
    //   },
    //   point: {
    //     radius: 5, // Consistent point size
    //     hoverRadius: 5, // Same as radius to avoid hover animations
    //     hitRadius: 5, // Same as radius to avoid hit animations
    //     hoverBorderWidth: 2, // Same as borderWidth to avoid hover animations
    //   },
    // },
  }

  return (
    <Box bg='black' height='205px' width='100%' position='relative' overflow='hidden'>
      <Line
        data={data}
        options={options}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />
    </Box>
  )
}

//   buyLabel: {
//     type: 'point',
//     xValue: bestBuyPosition
//       ? chartData?.data?.findIndex((point) => point.datetime === bestBuyPosition.timestamp)
//       : -1,
//     yValue: bestBuyPosition ? bestBuyPosition.price + 10 : 0,
//     radius: 1,
//     backgroundColor: black,
//     borderWidth: 0,
//     display: !!bestBuyPosition,
//   },
// },
