'use client'

import { Text, HStack, VStack, Box } from '@chakra-ui/react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import Skeleton from '@/components/common/skeleton'
import { useMarketPriceHistory } from '@/hooks/use-market-price-history'
import { useThemeProvider } from '@/providers'
import LimitlessLogo from '@/resources/icons/limitless-logo.svg'
import { useTradingService } from '@/services'
import { headline, paragraphMedium } from '@/styles/fonts/fonts.styles'

const ONE_HOUR = 3_600_000 // milliseconds in an hour

export const MarketPriceChart = () => {
  const { colors } = useThemeProvider()
  const [yesDate, setYesDate] = useState(
    Highcharts.dateFormat('%b %e, %Y %I:%M %p', Date.now()) ?? ''
  )
  const { market } = useTradingService()
  const outcomeTokensPercent = market?.prices
  const resolved = market?.winningOutcomeIndex === 0 || market?.winningOutcomeIndex === 1

  useEffect(() => {
    refetchPrices()
  }, [market])

  const getMaxChartTimestamp = (data?: number[][]) => {
    if (market) {
      if (new Date().getTime() > market.expirationTimestamp) {
        return market.expirationTimestamp + 1200000
      }
      return data ? data[data.length - 1]?.[0] : new Date().getTime()
    }
    return new Date().getTime()
  }

  // Function to generate chart options
  const getChartOptions = (data: number[][] | undefined): Highcharts.Options => ({
    chart: {
      zooming: {
        type: 'x',
      },
      height: 230,
      backgroundColor: colors.grey['100'],
      marginLeft: isMobile ? 75 : 50,
      marginRight: isMobile ? 10 : 5,
    },
    title: {
      text: undefined,
    },
    xAxis: {
      type: 'datetime',
      ordinal: false,
      tickPosition: 'outside',
      lineColor: colors.grey['200'],
      tickColor: colors.grey['200'],
      tickLength: 0,
      // max: getMaxChartTimestamp(data),
      labels: {
        step: 0,
        rotation: 0,
        align: 'center',
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: isMobile ? '14px' : '12px',
          color: colors.grey['400'],
        },
        formatter: function () {
          return Highcharts.dateFormat('%b %e', Number(this.value))
        },
      },
    },
    yAxis: {
      visible: true,
      min: 0,
      max: 100,
      tickInterval: 25,
      title: {
        text: 'Percentage (%)',
        style: {
          color: colors.grey['600'],
        },
      },
      labels: {
        format: '{value}%',
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: isMobile ? '14px' : '12px',
          color: colors.grey['400'],
        },
      },
      gridLineColor: colors.grey['200'],
      lineWidth: 1,
      lineColor: colors.grey['200'],
      tickWidth: 1,
      tickColor: colors.grey['200'],
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
        dataSorting: {
          enabled: false,
        },
        dataGrouping: {
          enabled: true,
          approximation: 'average', // Other options: 'sum', 'high', 'low', 'open', 'close'
          groupPixelWidth: 5, // Controls how aggressively data is grouped
        },
        lineWidth: 4,
        connectEnds: false,
        marker: {
          enabled: false,
        },
        point: {
          events: {
            mouseOver: function (this: Highcharts.Point) {
              setYesDate(Highcharts.dateFormat('%B %e, %Y %I:%M %p', this.x as number))
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
            [0, Highcharts.color('#0FC591').setOpacity(0.3).get('rgba')],
            //@ts-ignore
            [1, Highcharts.color('#0FC591').setOpacity(0).get('rgba')],
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
        color: '#0FC591',
        lineWidth: 2,
      },
    ],
  })

  // React Query to fetch the price data
  const { data: prices, refetch: refetchPrices } = useMarketPriceHistory(market)

  const chartData = useMemo(() => {
    const _prices: number[][] = prices ?? []
    const data = resolved
      ? [
          ...(_prices ?? []),
          !!_prices[_prices.length - 1]
            ? [
                _prices[_prices.length - 1][0] + ONE_HOUR,
                market?.winningOutcomeIndex === 0 ? 100 : 0,
              ]
            : [Date.now(), 100],
        ].filter((priceData) => {
          const [, value] = priceData
          return !!value
        })
      : _prices

    // special case hotfix
    // const special = {
    //   [getAddress('0xD0BC7FCea7500d485329e0aaE36e0512815684BF')]: {
    //     index: 0,
    //     timestamp: 1722745928000, // aug 4 2024
    //     exists: true,
    //   },
    // }
    // if (special[getAddress(marketAddr)]?.exists) {
    //   const _index = special[getAddress(marketAddr)].index
    //
    //   if (data[_index]) {
    //     data[_index][0] = special[getAddress(marketAddr)].timestamp
    //
    //     for (let index = 0; index < Array.from({ length: 10 }).length; index++) {
    //       data.splice(index + 1, 0, [data[index][0] + ONE_HOUR, data[index][1]])
    //     }
    //   }
    // }

    return data.sort((a, b) => a[0] - b[0])
  }, [prices, market?.winningOutcomeIndex, resolved])

  const marketActivePrice = useMemo(() => {
    return market?.tradeType === 'clob'
      ? chartData.at(-1)?.[1]?.toFixed(0) ?? outcomeTokensPercent?.[0]
      : outcomeTokensPercent?.[0]
  }, [chartData, market?.tradeType, outcomeTokensPercent])

  return !prices ? (
    <Box my='16px'>
      <Skeleton height={290} />
    </Box>
  ) : (
    <Paper my='16px' py='8px' px={0} bg='grey.100'>
      {/*{marketGroup ? (*/}
      {/*  <Menu isOpen={isMarketListOpen} onClose={onCloseMarketList} variant='transparent'>*/}
      {/*    <MenuButton*/}
      {/*      as={Button}*/}
      {/*      onClick={() => {*/}
      {/*        trackClicked(ClickEvent.ChangeMarketInGroupClicked, {*/}
      {/*          marketGroup,*/}
      {/*        })*/}
      {/*        onOpenMarketList()*/}
      {/*      }}*/}
      {/*      p={0}*/}
      {/*      h='unset'*/}
      {/*    >*/}
      {/*      <HStack gap={isMobile ? '16px' : '8px'} color='green.500'>*/}
      {/*        <Text {...paragraphMedium} color='green.500'>*/}
      {/*          {market?.title}*/}
      {/*        </Text>*/}
      {/*        <HStack gap={isMobile ? '8px' : '4px'}>*/}
      {/*          <ThumbsUpIcon width={16} height={16} />*/}
      {/*          <Text {...paragraphMedium} color='green.500'>*/}
      {/*            {!resolved ? outcomeTokensPercent?.[0] : winningIndex === 0 ? 100 : 0}% YES*/}
      {/*          </Text>*/}
      {/*          <Box*/}
      {/*            transform={`rotate(${isMarketListOpen ? '180deg' : 0})`}*/}
      {/*            transition='0.5s'*/}
      {/*            color='green.500'*/}
      {/*          >*/}
      {/*            <ChevronDownIcon width='16px' height='16px' />*/}
      {/*          </Box>*/}
      {/*        </HStack>*/}
      {/*      </HStack>*/}
      {/*    </MenuButton>*/}
      {/*    <MenuList borderRadius='2px' zIndex={2} marginTop='-8px'>*/}
      {/*      {marketGroup.markets.map((market) => (*/}
      {/*        <MenuItem*/}
      {/*          onClick={() => {*/}
      {/*            setSelectedMarket && setSelectedMarket(market)*/}
      {/*          }}*/}
      {/*          key={market.address}*/}
      {/*        >*/}
      {/*          {(market?.proxyTitle ?? market?.title)}*/}
      {/*        </MenuItem>*/}
      {/*      ))}*/}
      {/*    </MenuList>*/}
      {/*  </Menu>*/}
      {/*) : (*/}
      {/*  <HStack gap={'4px'}>*/}
      {/*    <Text {...headline} color='grey.800'>*/}
      {/*      {!resolved ? outcomeTokensPercent?.[0] : winningIndex === 0 ? 100 : 0}%*/}
      {/*    </Text>*/}
      {/*    <Text {...headline} color='grey.800'>*/}
      {/*      Yes*/}
      {/*    </Text>*/}
      {/*    /!*<ChevronDownIcon width={16} height={16} />*!/*/}
      {/*  </HStack>*/}
      {/*)}*/}
      <HStack px='8px' justifyContent='space-between'>
        <VStack alignItems='start'>
          <HStack>
            <VStack gap={-1} alignItems={'flex-start'}>
              <Text fontSize='sm' color='grey.500'>
                {yesDate}
              </Text>
            </VStack>
          </HStack>
          <HStack gap={'4px'} mt='4px' mb='4px'>
            <Text {...(isMobile ? paragraphMedium : headline)} color='grey.800'>
              {!resolved ? marketActivePrice : market?.winningOutcomeIndex === 0 ? 100 : 0}%
            </Text>
            <Text {...(isMobile ? paragraphMedium : headline)} color='grey.800'>
              Yes
            </Text>
          </HStack>
        </VStack>
        <HStack gap='4px'>
          <LimitlessLogo color={'var(--chakra-colors-grey-300)'} />
          <Text {...headline} color={'var(--chakra-colors-grey-300)'}>
            Limitless
          </Text>
        </HStack>
      </HStack>
      <HighchartsReact highcharts={Highcharts} options={getChartOptions(chartData)} />
    </Paper>
  )
}
