'use client'

import { Box, useToken } from '@chakra-ui/react'
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
import { format } from 'date-fns'
import { Line } from 'react-chartjs-2'
import { isMobile } from 'react-device-detect'
import { ClobPriceHistoryResponse } from '@/hooks/use-market-price-history'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface PriceChartProps {
  history: ClobPriceHistoryResponse[]
}

export const PriceChart = ({ history }: PriceChartProps) => {
  const [
    blue500,
    red500,
    green500,
    indigo500,
    grey100,
    grey300,
    grey500,
    orange500,
    grey50,
    yellow500,
    lime500,
    mint500,
    cyan500,
    purple500,
    indigo100,
    brown100,
    green100,
    red100,
    lime100,
    lime200,
    blue200,
    cyan100,
    pink100,
    pink200,
  ] = useToken('colors', [
    'blue.500',
    'red.500',
    'green.500',
    'indigo.500',
    'grey.100',
    'grey.300',
    'grey.500',
    'orange.500',
    'grey.50',
    'yellow.500',
    'lime.500',
    'mint.500',
    'cyan.500',
    'purple.500',
    '#027692',
    '#9d6619',
    '#275a35',
    '#ad0e3a',
    '#96ea5a',
    '#a3b60a',
    '#2b117f',
    '#8cc6d9',
    '#fc0ba9',
    '#631c6b',
  ])

  const seriesColors = [
    blue500,
    red500,
    green500,
    indigo500,
    orange500,
    yellow500,
    lime500,
    mint500,
    cyan500,
    purple500,
    indigo100,
    brown100,
    green100,
    red100,
    lime100,
    lime200,
    blue200,
    cyan100,
    pink100,
    pink200,
  ]

  function getUniqueTimestamps() {
    const timestamps = new Set<number>()
    const now = new Date().getTime()

    history.forEach((item) => {
      item.prices.forEach((price) => {
        timestamps.add(price.timestamp)
      })
    })

    timestamps.add(now)

    return Array.from(timestamps).sort((a, b) => a - b)
  }

  const timestamps = getUniqueTimestamps()

  const data: ChartData<'line'> = {
    labels: timestamps.map((ts) => format(new Date(ts), 'MMM d')),
    datasets: history
      .map((history, index) => {
        const sortedPrices = [...history.prices].sort((a, b) => a.timestamp - b.timestamp)

        if (sortedPrices.length === 0) {
          return {
            label: history.title,
            data: [],
            borderColor: seriesColors[index % seriesColors.length],
            backgroundColor: seriesColors[index % seriesColors.length],
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
            tension: 0,
            spanGaps: true,
          }
        }

        return {
          label: history.title,
          data: timestamps.map((ts) => {
            const exactMatch = history.prices.find((p) => p.timestamp === ts)
            if (exactMatch) {
              return +exactMatch.price
            }

            const previousPrices = history.prices.filter((p) => p.timestamp <= ts)
            if (previousPrices.length > 0) {
              const mostRecent = previousPrices.reduce((a, b) =>
                a.timestamp > b.timestamp ? a : b
              )
              return +mostRecent.price
            }

            if (sortedPrices.length > 0) {
              return +sortedPrices[0].price
            }

            return null
          }),
          borderColor: seriesColors[index % seriesColors.length],
          backgroundColor: seriesColors[index % seriesColors.length],
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
          tension: 0,
          spanGaps: true,
          segment: {
            borderColor: (ctx: any) => {
              if (!ctx.p0.parsed) return
              if (ctx.p0.parsed.x >= ctx.chart.hoverIndex) {
                return grey300
              }
            },
          },
        }
      })
      .filter((dataset) => dataset.data.length > 0), // Remove empty datasets
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
        ticks: {
          color: grey500,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          autoSkip: true,
          maxTicksLimit: 8,
        },
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
    <Box w='full' h={isMobile ? `${history.length * 40 + 100}px` : 240}>
      <Line data={data} options={options} />
    </Box>
  )
}
