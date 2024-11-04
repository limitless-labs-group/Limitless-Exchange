'use client'

import {
  Text,
  HStack,
  VStack,
  Box,
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
  useDisclosure,
  Button,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { rgba } from 'color2k'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { getAddress, zeroAddress } from 'viem'
import Paper from '@/components/common/paper'
import { defaultChain, newSubgraphURI } from '@/constants'
import { useMarketPriceHistory } from '@/hooks/use-market-price-history'
import { useThemeProvider } from '@/providers'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { useWinningIndex } from '@/services/MarketsService'
import { headline, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup } from '@/types'

const ONE_HOUR = 3_600_000 // milliseconds in an hour

// Define the MarketPriceChart component
export interface IMarketPriceChart {
  marketGroup?: MarketGroup
  market: Market
}

export const MarketPriceChart = ({ marketGroup, market }: IMarketPriceChart) => {
  const { colors } = useThemeProvider()
  // const { market, setMarket } = useTradingService()
  const [yesChance, setYesChance] = useState('')
  const [yesDate, setYesDate] = useState(
    Highcharts.dateFormat('%b %e, %Y %I:%M %p', Date.now()) ?? ''
  )
  const outcomeTokensPercent = market.prices
  const marketAddr = market.address[defaultChain.id] ?? zeroAddress
  const { data: winningIndex } = useWinningIndex(market?.address || '')
  const resolved = winningIndex === 0 || winningIndex === 1

  useEffect(() => {
    refetchPrices()
  }, [market])

  const { trackClicked } = useAmplitude()

  const {
    isOpen: isMarketListOpen,
    onOpen: onOpenMarketList,
    onClose: onCloseMarketList,
  } = useDisclosure()

  // Function to generate chart options
  const getChartOptions = (data: number[][] | undefined): Highcharts.Options => ({
    chart: {
      zooming: {
        type: 'x',
      },
      height: 230,
      backgroundColor: colors.grey['100'],
      marginLeft: 0,
      marginRight: 0,
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
      labels: {
        step: 0,
        rotation: 0,
        align: 'center',
        style: {
          fontFamily: 'Helvetica Neue',
          fontSize: isMobile ? '14px' : '12px',
          color: colors.grey['400'],
        },
        formatter: function () {
          return Highcharts.dateFormat('%b %e', Number(this.value))
        },
      },
    },
    yAxis: {
      visible: false,
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
        lineWidth: 4,
        marker: {
          enabled: false,
        },
        point: {
          events: {
            mouseOver: function () {
              //@ts-ignore
              setYesDate(Highcharts.dateFormat('%B %e, %Y %I:%M %p', Number(this.x)))
              //@ts-ignore
              setYesChance(this.y.toFixed(2))
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
            [0, Highcharts.color('#198020').setOpacity(0.3).get('rgba')],
            //@ts-ignore
            [1, Highcharts.color('#198020').setOpacity(0).get('rgba')],
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
        color: '#238020',
        lineWidth: 2,
      },
    ],
  })

  // React Query to fetch the price data
  const { data: prices, refetch: refetchPrices } = useMarketPriceHistory(market?.address)

  // const initialYesChance = useMemo(() => {
  //   if (market?.prices) {
  //     return market.prices[0].toFixed(2)
  //   }
  //   return '50.00'
  // }, [market?.prices])

  const chartData = useMemo(() => {
    const _prices: number[][] = prices ?? []
    const data = resolved
      ? [
          ...(_prices ?? []),
          !!_prices[_prices.length - 1]
            ? [_prices[_prices.length - 1][0] + ONE_HOUR, winningIndex === 0 ? 100 : 0]
            : [Date.now(), 100],
        ].filter((priceData) => {
          const [, value] = priceData
          return !!value
        })
      : _prices

    // special case hotfix
    const special = {
      [getAddress('0xD0BC7FCea7500d485329e0aaE36e0512815684BF')]: {
        index: 0,
        timestamp: 1722745928000, // aug 4 2024
        exists: true,
      },
    }
    if (special[getAddress(marketAddr)]?.exists) {
      const _index = special[getAddress(marketAddr)].index

      if (data[_index]) {
        data[_index][0] = special[getAddress(marketAddr)].timestamp

        for (let index = 0; index < Array.from({ length: 10 }).length; index++) {
          data.splice(index + 1, 0, [data[index][0] + ONE_HOUR, data[index][1]])
        }
      }
    }

    return data
  }, [prices, winningIndex, resolved])

  return (
    <Paper my='20px' py='8px' px={0} bg='grey.100' borderRadius='8px'>
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
      {/*          {market.title}*/}
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
      <Box px='8px'>
        <HStack>
          <VStack gap={-1} alignItems={'flex-start'}>
            <Text fontSize='sm' color='grey.500'>
              {yesDate}
            </Text>
          </VStack>
        </HStack>
        <HStack gap={'4px'} mt='4px'>
          <Text {...headline} color='grey.800'>
            {!resolved ? outcomeTokensPercent?.[0] : winningIndex === 0 ? 100 : 0}%
          </Text>
          <Text {...headline} color='grey.800'>
            Yes
          </Text>
          {/*<ChevronDownIcon width={16} height={16} />*/}
        </HStack>
      </Box>
      <HighchartsReact highcharts={Highcharts} options={getChartOptions(chartData)} />
    </Paper>
  )
}
