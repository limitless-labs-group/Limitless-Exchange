import { Button, HStack, Text } from '@chakra-ui/react'
import { PriceServiceConnection } from '@pythnetwork/price-service-client'
import axios from 'axios'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { memo, useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import Paper from '@/components/common/paper'
import { useThemeProvider } from '@/providers'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

const priceIds = {
  BTC: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  DOGE: 'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
  BRETT: '9b5729efe3d68e537cdcb2ca70444dea5f06e1660b562632609757076d0b9448',
  AAVE: '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
  APE: '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
}

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

const symbols = {
  BTC: 'Crypto.BITCOIN/USD',
  ETH: 'Crypto.ETH/USD',
  SOL: 'Crypto.SOL/USD',
  DOGE: 'Crypto.DOGE/USD',
  BRETT: 'Crypto.BRETT/USD',
  AAVE: 'Crypto.AAVE/USD',
  APE: 'Crypto.APE/USD',
}

function PythLiveChart({ id }: PythLiveChartProps) {
  const chartComponentRef = useRef(null)
  const [priceData, setPriceData] = useState<number[][]>([])
  const [timeRange, setTimeRange] = useState('1H') // default time range
  const [live, setLive] = useState(true) // live state
  const { colors } = useThemeProvider()

  const priceId = priceIds[id as keyof typeof priceIds]

  const connection = new PriceServiceConnection('https://hermes.pyth.network')

  const getHistory = async () => {
    try {
      const result = await axios.get<HistoricalDataItem[]>(
        `https://web-api.pyth.network/history?symbol=${
          symbols[id as keyof typeof symbols]
        }&range=${timeRange}&cluster=pythnet`
      )
      const preparedData = result.data.map((priceData) => {
        return [
          new Date(priceData.timestamp).getTime(),
          +priceData.avg_price.toFixed(priceData.avg_price > 1 ? 2 : 6),
        ]
      })
      setPriceData(preparedData)
    } catch (e) {
      console.log(`get price history failed`, e)
    }
  }

  useEffect(() => {
    getHistory()
    const updateDataForTimeRange = () => {
      try {
        if (live) {
          connection.subscribePriceFeedUpdates([priceId], (priceFeed) => {
            // console.log(
            //   `Received an update for ${priceFeed.id}: ${formatUnits(
            //     BigInt(priceFeed.getPriceNoOlderThan(60)?.price || '1'),
            //     Math.abs(priceFeed.getPriceNoOlderThan(60)?.expo || 8)
            //   )}`
            // )
            const priceEntity = priceFeed.getPriceNoOlderThan(60)
            const formattedPrice = +formatUnits(
              BigInt(priceEntity ? priceEntity.price : '1'),
              Math.abs(priceEntity ? priceEntity.expo : 8)
            )
            const price = +formattedPrice.toFixed(formattedPrice > 1 ? 2 : 6)
            const latestPriceFeedEntity = priceFeed.getPriceNoOlderThan(60)
            const currentTime = latestPriceFeedEntity
              ? latestPriceFeedEntity.publishTime * 1000
              : new Date().getTime()
            // @ts-ignore
            const chart = chartComponentRef.current?.chart
            if (chart) {
              chart.series[0].addPoint([currentTime, price], true, false)
            }
          })
        } else {
          getHistory()
        }
      } catch (e) {
        console.log('error')
      }
    }

    updateDataForTimeRange()

    return () => {
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

  const options = {
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
          fontFamily: 'Helvetica Neue',
          fontSize: isMobile ? '14px' : '12px',
          fontWeight: 500,
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
          fontFamily: 'Helvetica Neue',
          fontSize: isMobile ? '14px' : '12px',
          fontWeight: 500,
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
        data: priceData,
        color: '#00C7C7',
        name: id,
        lineWidth: 1,
      },
    ],
  }

  return (
    <Paper bg='grey.100' my='20px' borderRadius='8px'>
      <HStack gap='8px' mb='16px'>
        <Text {...paragraphRegular} color='grey.500'>
          Zoom
        </Text>
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
      <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
    </Paper>
  )
}

export const MarketAssetPriceChart = memo(PythLiveChart)
