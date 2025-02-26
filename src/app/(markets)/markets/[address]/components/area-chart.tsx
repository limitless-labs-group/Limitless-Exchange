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
import { ClobPriceHistoryResponse } from '@/hooks/use-market-price-history'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface PriceChartProps {
  history: ClobPriceHistoryResponse[]
}

export const PriceChart = ({ history }: PriceChartProps) => {
  const [blue500, red500, green500, indigo500, grey100, grey300, grey500, orange500, grey50] =
    useToken('colors', [
      'blue.500',
      'red.500',
      'green.500',
      'indigo.500',
      'grey.100',
      'grey.300',
      'grey.500',
      'orange.500',
      'grey.50',
    ])

  const seriesColors = [blue500, red500, green500, indigo500, orange500, grey50]

  // Prepare data for Chart.js
  function getUniqueTimestamps() {
    const timestamps = new Set<number>()

    history.forEach((item) => {
      item.prices.forEach((price) => {
        timestamps.add(price.timestamp)
      })
    })

    return Array.from(timestamps).sort((a, b) => a - b)
  }

  const timestamps = getUniqueTimestamps()

  const data: ChartData<'line'> = {
    labels: timestamps.map((ts) => format(new Date(ts), 'MMM d')),
    datasets: history.map((history, index) => {
      const sortedPrices = [...history.prices].sort((a, b) => a.timestamp - b.timestamp)
      const firstPrice = sortedPrices[0]?.price || 0
      const lastPrice = sortedPrices[sortedPrices.length - 1]?.price || firstPrice

      return {
        label: history.title,
        data: timestamps.map((ts) => {
          const pricePoint = history.prices.find((p) => p.timestamp === ts)
          if (pricePoint) {
            return +pricePoint.price
          }
          if (ts <= sortedPrices[0]?.timestamp) {
            return +firstPrice
          }
          if (ts >= sortedPrices[sortedPrices.length - 1]?.timestamp) {
            return +lastPrice
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
    }),
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
    <Box w='full' h={240}>
      <Line data={data} options={options} />
    </Box>
  )
}
