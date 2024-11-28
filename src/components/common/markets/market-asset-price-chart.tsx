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
  AAVE: '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
  APE: '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
  ATOM: '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
  APT: '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
  BRETT: '9b5729efe3d68e537cdcb2ca70444dea5f06e1660b562632609757076d0b9448',
  BTC: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  DOGE: 'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
  EIGEN: '0xc65db025687356496e8653d0d6608eec64ce2d96e2e28c530e574f0e4f712380',
  ENS: '0xb98ab6023650bd2edc026b983fb7c2f8fa1020286f1ba6ecf3f4322cd83b72a6',
  ETH: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  FLOKI: '0x6b1381ce7e874dc5410b197ac8348162c0dd6c0d4c9cd6322672d6c2b1d58293',
  RENDER: '0x3d4a2bd9535be6ce8059d75eadeba507b043257321aa544717c56fa19b49e35d',
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  SUI: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
  ZRO: '0x3bd860bea28bf982fa06bcf358118064bb114086cc03993bd76197eaab0b8018',
  ZK: '0xcc03dc09298fb447e0bf9afdb760d5b24340fd2167fd33d8967dd8f9a141a2e8',
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
  AAVE: 'Crypto.AAVE/USD',
  APE: 'Crypto.APE/USD',
  ATOM: 'Crypto.ATOM/USD',
  APT: 'Crypto.APT/USD',
  BRETT: 'Crypto.BRETT/USD',
  BTC: 'Crypto.BITCOIN/USD',
  DOGE: 'Crypto.DOGE/USD',
  EIGEN: 'Crypto.EIGEN/USD',
  ENS: 'Crypto.ENS/USD',
  ETH: 'Crypto.ETH/USD',
  FLOKI: 'Crypto.FLOKI/USD',
  RENDER: 'Crypto.RENDER/USD',
  SOL: 'Crypto.SOL/USD',
  SUI: 'Crypto.SUI/USD',
  ZRO: 'Crypto.ZRO/USD',
  ZK: 'Crypto.ZK/USD',
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
        return [new Date(priceData.timestamp).getTime(), +priceData.avg_price.toFixed(6)]
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
            try {
              const priceEntity = priceFeed.getPriceNoOlderThan(60)
              const formattedPrice = +formatUnits(
                BigInt(priceEntity ? priceEntity.price : '1'),
                Math.abs(priceEntity ? priceEntity.expo : 8)
              )
              const price = +formattedPrice.toFixed(6)
              const latestPriceFeedEntity = priceFeed.getPriceNoOlderThan(60)
              const currentTime = latestPriceFeedEntity
                ? latestPriceFeedEntity.publishTime * 1000
                : new Date().getTime()
              // @ts-ignore
              const chart = chartComponentRef.current?.chart
              if (chart) {
                chart.series[0].addPoint([currentTime, price], true, false)
              }
            } catch (e) {
              console.log(e)
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
          fontFamily: 'Inter',
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
          fontFamily: 'Inter',
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
    <Paper bg='grey.100' my='20px'>
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
