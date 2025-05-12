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
import { isMobile } from 'react-device-detect'
import { ChartDataResponse } from '@/hooks/use-win-chart-data'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, annotationPlugin)

interface PriceChartProps {
  chartData: ChartDataResponse
}

export const WinChart = ({ chartData }: PriceChartProps) => {
  const [green500, black] = useToken('colors', ['green.500', 'black'])

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
        borderWidth: isMobile ? 1.5 : 2,
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
        pointRadius: isMobile ? 3 : 5,
        pointHoverRadius: isMobile ? 3 : 5,
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
              size: window?.innerWidth < 768 ? 10 : 12,
              weight: 'bold',
            },
            padding: {
              top: window?.innerWidth < 768 ? 3 : 5,
              bottom: window?.innerWidth < 768 ? 3 : 5,
              left: window?.innerWidth < 768 ? 3 : 5,
              right: window?.innerWidth < 768 ? 3 : 5,
            },
            borderWidth: 0,
            display: !!bestBuyPosition,
            position: 'start',
            yAdjust: window?.innerWidth < 768 ? -10 : -15,
            xAdjust: window?.innerWidth < 768 ? 3 : 5,
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
  }

  return (
    <Box
      bg='black'
      height={{ base: '110px', md: '205' }}
      width='100%'
      position='relative'
      overflow='hidden'
    >
      <Line
        data={data}
        options={options}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />
    </Box>
  )
}
