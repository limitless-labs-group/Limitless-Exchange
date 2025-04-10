import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { getAddress, zeroAddress } from 'viem'
import Paper from '@/components/common/paper'
import {
  BuyForm,
  SellForm,
  LoadingForm,
} from '@/app/(markets)/markets/[address]/components/trade-widgets'
import {
  StrategyChangedMetadata,
  ChangeEvent,
  useAmplitude,
  useTradingService,
  usePosition,
} from '@/services'
import { controlsMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

interface MarketTradingFormProps {
  market: Market
}

export const MarketTradingForm = ({ market }: MarketTradingFormProps) => {
  const [outcomeIndex, setOutcomeIndex] = useState(0)
  /**
   * ANALITYCS
   */
  const { trackChanged } = useAmplitude()

  const { data: allMarketsPositions } = usePosition()

  /**
   * TRADING SERVICE
   */
  const { strategy, setStrategy, status } = useTradingService()

  /**
   * MARKET DATA
   */
  const marketAddress = getAddress(market?.address ?? zeroAddress)

  const positions = useMemo(
    () =>
      allMarketsPositions?.positions.filter(
        (position) => position.market.slug?.toLowerCase() === market?.slug?.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  const widgetPosition = useMemo(() => {
    return isMobile ? 'relative' : 'fixed'
  }, [])

  useEffect(() => {
    setStrategy('Buy')
  }, [])

  return (
    <Paper
      bg='grey.50'
      w={isMobile ? 'full' : '312px'}
      p={isMobile ? 0 : '8px'}
      h={isMobile ? '100dvh' : 'unset'}
      overflowY='scroll'
      position={widgetPosition}
      left={isMobile ? 0 : '936px'}
    >
      <HStack
        w={'240px'}
        mx='auto'
        bg='rgba(255, 255, 255, 0.20)'
        borderRadius='8px'
        py='2px'
        px={isMobile ? '4px' : '2px'}
        mb={isMobile ? '32px' : '24px'}
      >
        <Button
          h={isMobile ? '28px' : '20px'}
          flex='1'
          py='2px'
          borderRadius='8px'
          bg={strategy === 'Buy' ? 'white' : 'unset'}
          color={strategy === 'Buy' ? 'black' : 'white'}
          _hover={{
            backgroundColor: strategy === 'Buy' ? 'white' : 'rgba(255, 255, 255, 0.30)',
          }}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Buy selected',
              marketAddress,
              marketMarketType: 'AMM',
            })
            setStrategy('Buy')
          }}
        >
          <Text {...controlsMedium} color={strategy == 'Buy' ? 'font' : 'fontLight'}>
            Buy
          </Text>
        </Button>
        <Button
          h={isMobile ? '28px' : '20px'}
          flex='1'
          borderRadius='8px'
          py='2px'
          bg={strategy === 'Sell' ? 'white' : 'unset'}
          color={strategy === 'Sell' ? 'black' : 'white'}
          _hover={{
            backgroundColor: strategy === 'Sell' ? 'white' : 'rgba(255, 255, 255, 0.30)',
          }}
          _disabled={{
            opacity: '50%',
            pointerEvents: 'none',
          }}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Sell selected',
              marketAddress,
              marketMarketType: 'AMM',
            })
            setStrategy('Sell')
          }}
          isDisabled={!positions?.length}
        >
          <Text {...controlsMedium} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
            Sell
          </Text>
        </Button>
      </HStack>
      {strategy === 'Buy' && (
        <BuyForm
          market={market}
          setOutcomeIndex={setOutcomeIndex}
          outcomeTokensPercent={market?.prices}
        />
      )}
      {strategy === 'Sell' ? (
        status === 'Loading' ? (
          <LoadingForm outcomeIndex={outcomeIndex} />
        ) : (
          <Box mx={isMobile ? '16px' : 0}>
            <SellForm setOutcomeIndex={setOutcomeIndex} />
          </Box>
        )
      ) : null}
    </Paper>
  )
}
