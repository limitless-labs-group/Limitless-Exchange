import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import GroupMarketSectionTabs from '@/app/(markets)/markets/[address]/components/group-market-section-tabs'
import { useMarketOrders } from '@/hooks/use-market-orders'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { ClickEvent, QuickBetClickedMetadata, useAmplitude, useTradingService } from '@/services'
import { h3Medium, headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { ClobPosition } from '@/types/orders'
import { NumberUtil } from '@/utils'

interface GroupMarketSectionSmallProps {
  market: Market
}

export default function GroupMarketSectionSmall({ market }: GroupMarketSectionSmallProps) {
  const { setMarket, market: selectedMarket, setClobOutcome, clobOutcome } = useTradingService()
  const { data: userOrders } = useMarketOrders(market?.slug)
  const { trackClicked } = useAmplitude()
  const handleOutcomeClicked = (outcome: number) => {
    trackClicked<QuickBetClickedMetadata>(ClickEvent.QuickBetClicked, {
      source: 'Market page from outcomes section',
      value: outcome ? 'small no button' : 'small yes button',
    })
    setClobOutcome(outcome)
    if (market.slug !== selectedMarket?.slug) {
      setMarket(market)
    }
  }
  const calculateTotalContracts = (orders: ClobPosition[]) => {
    return orders.reduce((a, acc) => {
      return new BigNumber(a)
        .plus(new BigNumber(formatUnits(BigInt(acc.originalSize), market.collateralToken.decimals)))
        .toNumber()
    }, 0)
  }

  const calculateAveragePrice = (orders: ClobPosition[]) => {
    const totalSharesMulAmount = orders.reduce((a, acc) => {
      const priceFormatted = new BigNumber(acc.price).multipliedBy(100).toFixed(1)
      const sharesFormatted = formatUnits(BigInt(acc.originalSize), market.collateralToken.decimals)
      return new BigNumber(a)
        .plus(new BigNumber(priceFormatted).multipliedBy(sharesFormatted))
        .toNumber()
    }, 0)
    const totalShares = calculateTotalContracts(orders)
    return new BigNumber(totalSharesMulAmount).dividedBy(totalShares).decimalPlaces(1).toFixed()
  }
  const userOrdersWithOutcomes = useMemo(() => {
    if (!userOrders?.length) {
      return null
    }
    const yesOrders = userOrders.filter((order) => order.token === market.tokens.yes)
    const noOrders = userOrders.filter((order) => order.token === market.tokens.no)
    const result = []
    if (yesOrders.length) {
      result.push({
        type: 'Yes',
        contracts: calculateTotalContracts(yesOrders),
        averagePrice: calculateAveragePrice(yesOrders),
      })
    }
    if (noOrders.length) {
      result.push({
        type: 'No',
        contracts: calculateTotalContracts(noOrders),
        averagePrice: calculateAveragePrice(noOrders),
      })
    }
    return result
  }, [market.tokens, userOrders])

  const handleAccordionChange = () => {
    if (selectedMarket?.slug !== market.slug) {
      setMarket(market)
    }
  }

  return (
    <AccordionItem borderColor='grey.100'>
      <AccordionButton gap='4px' display='block' onClick={handleAccordionChange}>
        <HStack w='full'>
          <HStack w='full' justifyContent='space-between'>
            <Box>
              <Text textAlign='left' {...headline}>
                {market.proxyTitle || market.title}
              </Text>
              <HStack w={isMobile ? 'full' : 'unset'} gap='4px' color='grey.500'>
                <VolumeIcon width={16} height={16} />
                <Text {...paragraphRegular} color='grey.500'>
                  Volume
                </Text>
                <Text {...paragraphRegular} color='grey.500'>
                  {NumberUtil.convertWithDenomination(market?.volumeFormatted || '0', 6)}{' '}
                  {market?.collateralToken.symbol}
                </Text>
              </HStack>
            </Box>
            <HStack gap='16px'>
              <Text {...h3Medium}>
                {new BigNumber(market.prices[0]).multipliedBy(100).toFixed(0)}%
              </Text>
            </HStack>
          </HStack>
          <AccordionIcon color='grey.500' />
        </HStack>
        <HStack w='full' gap='8px' mt='16px' flexWrap='wrap'>
          {Boolean(userOrdersWithOutcomes?.length) && (
            <HStack gap='8px' my='16px'>
              <Box bg='grey.100' borderRadius='8px' px='4px' py='2px'>
                <Text {...paragraphRegular}>{userOrders?.length} Open orders</Text>
              </Box>
              {userOrdersWithOutcomes?.map((order) => (
                <HStack
                  key={order.type}
                  bg={order.type === 'Yes' ? 'greenTransparent.100' : 'redTransparent.100'}
                  borderRadius='8px'
                  px='4px'
                  py='2px'
                >
                  <Text
                    {...paragraphRegular}
                    color={order.type === 'Yes' ? 'green.500' : 'red.500'}
                  >
                    {order.type} {order.contracts} Contracts | {order.averagePrice}¢
                  </Text>
                </HStack>
              ))}
            </HStack>
          )}
        </HStack>
      </AccordionButton>
      <HStack w='full' gap='8px'>
        <Button
          w='full'
          h='32px'
          bg={
            selectedMarket?.slug === market.slug && !clobOutcome
              ? 'green.500'
              : 'greenTransparent.100'
          }
          color={selectedMarket?.slug === market.slug && !clobOutcome ? 'white' : 'green.500'}
          borderRadius='8px'
          _hover={{
            bg: 'green.500',
            color: 'white',
          }}
          onClick={() => handleOutcomeClicked(0)}
        >
          Yes {NumberUtil.multiply(market.prices[0], 100)}%
        </Button>
        <Button
          w='full'
          h='32px'
          bg={
            selectedMarket?.slug === market.slug && !!clobOutcome ? 'red.500' : 'redTransparent.100'
          }
          color={selectedMarket?.slug === market.slug && !!clobOutcome ? 'white' : 'red.500'}
          borderRadius='8px'
          _hover={{
            bg: 'red.500',
            color: 'white',
          }}
          onClick={() => handleOutcomeClicked(1)}
        >
          No {NumberUtil.multiply(market.prices[1], 100)}%
        </Button>
      </HStack>
      <AccordionPanel pb={0}>
        <Box mt='12px'>
          <GroupMarketSectionTabs mobileView={true} />
        </Box>
      </AccordionPanel>
    </AccordionItem>
  )
}
