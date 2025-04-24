import { Button, HStack, Text } from '@chakra-ui/react'
import { PriceServiceConnection } from '@pythnetwork/price-service-client'
import axios from 'axios'
import Highcharts from 'highcharts'
import type { Options } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { memo, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import Loader from '@/components/common/loader'
import Paper from '@/components/common/paper'
import { CHART_SYMBOLS, PRICES_IDS } from '@/app/draft/components'
import { useThemeProvider } from '@/providers'
import { headline, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface HistoricalDataItem {
  avg_confidence: number
  avg_emaConfidence: number
  avg_emaPrice: number
  avg_price: number
  close_price: number
  end_slot: number
  high_price: number
  low_price: number
  open_price: number
  start_slot: number
  timestamp: string
}

interface PythLiveChartProps {
  id: string
}

function PythLiveChart({ id }: PythLiveChartProps) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
  const [priceData, setPriceData] = useState<number[][]>([])
  const [livePrice, setLivePrice] = useState<number>()
  const [priceLoading, setPriceLoading] = useState(false)

  const [timeRange, setTimeRange] = useState('1H') // default time range
  const [live, setLive] = useState(true) // live state
  const { colors } = useThemeProvider()

  const priceId = PRICES_IDS[id as keyof typeof PRICES_IDS]

  const connection = new PriceServiceConnection('https://hermes.pyth.network')

  const getHistory = async () => {
    try {
      setPriceData([])
      setPriceLoading(true)
      const result = await axios.get<HistoricalDataItem[]>(
        `https://web-api.pyth.network/history?symbol=${
          CHART_SYMBOLS[id as keyof typeof CHART_SYMBOLS]
        }&range=${timeRange}&cluster=pythnet`
      )
      const preparedData = result.data.map((priceData) => {
        return [new Date(priceData.timestamp).getTime(), +priceData.avg_price.toFixed(6)]
      })
      setPriceData(preparedData)
    } catch (e) {
      console.log(`get price history failed`, e)
    } finally {
      setPriceLoading(false)
    }
  }

  console.log(livePrice)

  useEffect(() => {
    let subscription: any

    const updateDataForTimeRange = async () => {
      // await getHistory()  //it needs for historical data on live mode (data before live updates)

      try {
        if (live) {
          setPriceData([])
          subscription = connection.subscribePriceFeedUpdates([priceId], (priceFeed) => {
            try {
              const priceEntity = priceFeed.getPriceNoOlderThan(60)
              if (priceEntity) {
                const formattedPrice = +formatUnits(
                  BigInt(priceEntity ? priceEntity.price : '1'),
                  Math.abs(priceEntity ? priceEntity.expo : 8)
                )

                const latestPriceFeedEntity = priceFeed.getPriceNoOlderThan(60)
                const currentTime = latestPriceFeedEntity
                  ? latestPriceFeedEntity.publishTime * 1000
                  : new Date().getTime()

                const chart = chartComponentRef.current?.chart

                if (chart) {
                  setLivePrice(formattedPrice)
                  chart.series[0].addPoint([currentTime, formattedPrice], true, false)
                }
              }
            } catch (e) {
              console.error('Error processing live data:', e)
            }
          })
        } else {
          await getHistory()
        }
      } catch (e) {
        console.error('Error updating data:', e)
      }
    }

    updateDataForTimeRange()

    return () => {
      if (subscription) {
        connection.unsubscribePriceFeedUpdates(subscription)
      }
      connection.closeWebSocket()
    }
  }, [live, timeRange])

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range)
    setLive(false) // switch to historical mode
  }

  const handleLiveToggle = () => {
    setTimeRange('1D')
    setLive(true)
  }

  const options: Options = {
    chart: {
      type: 'line',
      backgroundColor: colors.grey['100'],
      height: '220px',
    },
    xAxis: {
      type: 'datetime',
      lineColor: colors.grey['200'],
      tickColor: colors.grey['200'],
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: isMobile ? '14px' : '12px',
          fontWeight: '500',
          color: colors.grey['400'],
        },
      },
    },
    yAxis: {
      title: {
        text: undefined,
      },
      lineColor: colors.grey['200'],
      tickColor: colors.grey['200'],
      gridLineColor: colors.grey['200'],
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: isMobile ? '14px' : '12px',
          fontWeight: '500',
          color: colors.grey['400'],
        },
      },
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        type: 'line',
        data: priceData,
        color: '#00C7C7',
        name: id,
        lineWidth: 1,
      } as Highcharts.SeriesLineOptions,
    ],
  }

  return (
    <Paper bg='grey.100' my='20px'>
      <HStack gap='8px' mb='16px'>
        <CurrentPriceDisplay
          priceData={priceData}
          live={live}
          livePrice={livePrice}
          priceLoading={priceLoading}
        />
        <HStack>
          <Button
            variant='transparentGray'
            onClick={handleLiveToggle}
            bg={live ? 'grey.300' : 'grey.200'}
          >
            Live
          </Button>
          {['1H', '1D', '1W', '1M'].map((period) => (
            <Button
              key={period}
              variant='transparentGray'
              onClick={() => handleTimeRangeChange(period)}
              bg={period === timeRange && !live ? 'grey.300' : 'grey.200'}
            >
              {period}
            </Button>
          ))}
        </HStack>
      </HStack>
      <LoadingOrEmptyContainer
        isLoading={priceLoading}
        noData={live ? !livePrice : !Boolean(priceData.length)}
        noDataText={live ? 'No live data available' : 'No data available for the requested period.'}
      >
        <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
      </LoadingOrEmptyContainer>
    </Paper>
  )
}

interface CurrentPriceDisplayProps {
  priceData: number[][]
  live: boolean
  priceLoading: boolean
  livePrice?: number
}

const LoadingOrEmptyContainer = ({
  isLoading,
  noData,
  noDataText,
  children,
}: PropsWithChildren<{ isLoading: boolean; noData: boolean; noDataText: string }>) => {
  if (isLoading) {
    return (
      <HStack h='220px' justifyContent='center'>
        <Loader />
      </HStack>
    )
  }
  if (noData) {
    return (
      <HStack h='220px' justifyContent='center'>
        <Text {...paragraphMedium}>{noDataText}</Text>
      </HStack>
    )
  }
  return children
}

const CurrentPriceDisplay = memo(
  ({ priceData, live, livePrice, priceLoading }: CurrentPriceDisplayProps) => {
    if (priceLoading) {
      return (
        <Text {...paragraphRegular} color='grey.800'>
          <Text as='span' color='grey.400'>
            Loading...
          </Text>
        </Text>
      )
    }

    if (!priceData.length) {
      return (
        <Text {...paragraphRegular} color='grey.800'>
          <Text as='span' color='grey.400'>
            No price
          </Text>
        </Text>
      )
    }

    const price = live ? livePrice : priceData[priceData.length - 1][1]

    return (
      <Text {...paragraphRegular} color='grey.800'>
        <Text
          as='span'
          {...(isMobile ? paragraphMedium : headline)}
          color='grey.800'
          aria-label={`Current price: ${price}`}
        >
          $
          {Number(price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Text>
    )
  }
)

CurrentPriceDisplay.displayName = 'CurrentPriceDisplay'

export const MarketAssetPriceChart = memo(PythLiveChart)
