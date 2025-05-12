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
import { useEffect, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { isMobile } from 'react-device-detect'
import { PriceHistory } from '@/types'

const legendMargin = {
  id: 'legendMargin',
  beforeInit(chart: any) {
    const fitValue = chart.legend.fit
    chart.legend.fit = function fit() {
      fitValue.bind(chart.legend)()
      this.height += 24 // Space below legend
    }
  },
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  legendMargin
)

interface PriceChartProps {
  history: PriceHistory[]
}

export const PriceChart = ({ history }: PriceChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [
    blue500,
    red500,
    green500,
    indigo500,
    grey100,
    grey300,
    grey500,
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
  ] = useToken('colors', [
    'blue.500',
    'red.500',
    'green.500',
    'indigo.500',
    'grey.100',
    'grey.300',
    'grey.500',
    'orange.500',
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

  const data: ChartData<'line'> = {
    labels: history[0].prices
      .slice()
      .map((ts) =>
        new Date(ts.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric' })
      ),
    datasets: history
      .map((history, index) => {
        return {
          label: history.title,
          data: history.prices.slice().map((price) => price.price),
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
        display: history.length > 2,
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
        // @ts-ignore
        backgroundColor: (context) => {
          if (history.length === 1) {
            const dp = context.tooltip.dataPoints?.[0]
            return dp?.dataset?.borderColor || blue500
          }
          return grey500
        },
        borderColor: 'transparent',
        borderWidth: 0,
        caretSize: 0,
        caretPadding: 12,
        padding: {
          top: 2,
          bottom: 0,
          left: 4,
          right: 4,
        },
        boxWidth: history.length === 1 ? 0 : 12,
        boxHeight: 1,
        boxPadding: history.length === 1 ? 0 : 6,
        borderRadius: 6,
        displayColors: true,
        callbacks: {
          title: () => '',
          label: (context) => {
            if (history.length === 1) {
              const value = context.dataset.data[context.dataIndex] || 50
              return `Yes ${(value as number).toFixed(0)}%`
            }
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${value.toFixed(0)}% ${label}`
          },
        },
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
        shadowColor: 'transparent',
      },
      // @ts-ignore
      verticalLine: {
        beforeDraw: (chart: any) => {
          if (chart.tooltip._active && chart.tooltip._active.length) {
            const activePoint = chart.tooltip._active[0]
            const ctx = chart.ctx
            const x = activePoint.element.x
            const topY = chart.scales.y.top - 20
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

            const dataIndex = activePoint.index
            // Find the original timestamp from your history data
            // Assuming history[0] is the main series
            const originalTimestamp = history[0].prices[dataIndex]?.timestamp
            if (originalTimestamp) {
              // ... inside beforeDraw
              const formattedDate = format(new Date(originalTimestamp), 'MMM d, yy’ h:mm a')
              ctx.font = 'lighter 12px Inter, sans-serif'
              ctx.fillStyle = grey500
              ctx.textBaseline = 'bottom'
              let textX = x + 6
              let textAlign = 'left'
              const textWidth = ctx.measureText(formattedDate).width

              if (textX + textWidth > chart.width - 8) {
                textX = x - 10
                textAlign = 'right'
              }
              ctx.textAlign = textAlign
              ctx.fillText(formattedDate, textX, topY + 16)
            }

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
          maxTicksLimit: 5,
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

  useEffect(() => {
    const box = chartRef.current
    if (!box) return

    //@ts-ignore
    const chartInstance = ChartJS.getChart(box.querySelector('canvas'))

    const handleMouseLeave = () => {
      if (chartInstance) {
        //@ts-ignore
        chartInstance.hoverIndex = undefined
        chartInstance.update()
      }
    }

    box.addEventListener('mouseleave', handleMouseLeave)
    return () => box.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  return (
    <Box ref={chartRef} w='full' h={isMobile ? `${history.length * 40 + 100}px` : 240}>
      <Line data={data} options={options} />
    </Box>
  )
}
