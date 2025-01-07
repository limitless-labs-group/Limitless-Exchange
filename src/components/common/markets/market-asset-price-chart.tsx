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
import { headline, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

const priceIds = {
  AAVE: '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
  AERO: '0x9db37f4d5654aad3e37e2e14ffd8d53265fb3026d1d8f91146539eebaa2ef45f',
  ALGO: '0xfa17ceaf30d19ba51112fdcc750cc83454776f47fb0112e4af07f15f4bb1ebc0',
  APE: '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
  ATOM: '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
  APT: '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
  AVAX: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
  DOT: '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
  EIGEN: '0xc65db025687356496e8653d0d6608eec64ce2d96e2e28c530e574f0e4f712380',
  ENS: '0xb98ab6023650bd2edc026b983fb7c2f8fa1020286f1ba6ecf3f4322cd83b72a6',
  FTM: '0x5c6c0d2386e3352356c3ab84434fafb5ea067ac2678a38a338c4a69ddc4bdb0c',
  HBAR: '0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd',
  ICP: '0xc9907d786c5821547777780a1e4f89484f3417cb14dd244f2b0a34ea7a554d67',
  INJ: '0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592',
  JUP: '0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996',
  LDO: '0xc63e2a7f37a04e5e614c07238bedb25dcc38927fba8fe890597a593c0b2fa4ad',
  LINK: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
  NEAR: '0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
  ONDO: '0xd40472610abe56d36d065a0cf889fc8f1dd9f3b7f2a478231a5fc6df07ea5ce3',
  OP: '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
  PYTH: '0x0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
  RENDER: '0x3d4a2bd9535be6ce8059d75eadeba507b043257321aa544717c56fa19b49e35d',
  SUI: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
  WLD: '0xd6835ad1f773de4a378115eb6824bd0c0e42d84d1c84d9750e853fb6b6c7794a',
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
  AERO: 'Crypto.AERO/USD',
  ALGO: 'Crypto.ALGO/USD',
  APE: 'Crypto.APE/USD',
  ATOM: 'Crypto.ATOM/USD',
  APT: 'Crypto.APT/USD',
  AVAX: 'Crypto.AVAX/USD',
  DOT: 'Crypto.DOT/USD',
  EIGEN: 'Crypto.EIGEN/USD',
  ENS: 'Crypto.ENS/USD',
  FTM: 'Crypto.FTM/USD',
  HBAR: 'Crypto.HBAR/USD',
  ICP: 'Crypto.ICP/USD',
  INJ: 'Crypto.INJ/USD',
  JUP: 'Crypto.JUP/USD',
  LDO: 'Crypto.LDO/USD',
  LINK: 'Crypto.LINK/USD',
  NEAR: 'Crypto.NEAR/USD',
  ONDO: 'Crypto.ONDO/USD',
  OP: 'Crypto.OP/USD',
  PYTH: 'Crypto.PYTH/USD',
  RENDER: 'Crypto.RENDER/USD',
  SUI: 'Crypto.SUI/USD',
  WLD: 'Crypto.WLD/USD',
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
  console.log('price', priceData)

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
        <Text {...paragraphRegular} color='grey.800'>
          {priceData.length > 0 ? (
            <Text
              as='span'
              {...(isMobile ? paragraphMedium : headline)}
              color='grey.800'
              aria-label={`Current price: ${priceData[priceData.length - 1][1]}`}
            >
              $
              {Number(priceData[priceData.length - 1][1]).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </Text>
          ) : (
            <Text as='span' color='grey.400'>
              Loading...
            </Text>
          )}
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
