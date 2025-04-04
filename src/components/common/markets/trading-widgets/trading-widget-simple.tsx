import { Button, HStack, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import MarketPageBuyForm from '@/components/common/markets/market-page-buy-form'
import Paper from '@/components/common/paper'
import { LoadingForm, SellForm } from '@/app/(markets)/markets/[address]/components'
import {
  ChangeEvent,
  StrategyChangedMetadata,
  useAmplitude,
  usePosition,
  useTradingService,
} from '@/services'
import { controlsMedium } from '@/styles/fonts/fonts.styles'

interface TradingWidgetSimpleProps {
  fullSizePage?: boolean
}

export default function TradingWidgetSimple({ fullSizePage = false }: TradingWidgetSimpleProps) {
  const [outcomeIndex, setOutcomeIndex] = useState(0)
  const { strategy, setStrategy, market, status } = useTradingService()
  const { trackChanged } = useAmplitude()
  const { data: allMarketsPositions } = usePosition()

  const positions = useMemo(
    () =>
      allMarketsPositions?.positions.filter((position) => position.market.slug === market?.slug),
    [allMarketsPositions, market]
  )

  return (
    <Paper
      borderRadius='8px'
      overflowX='hidden'
      p='8px'
      position='relative'
      w={fullSizePage ? { base: '350px', xl: '400px', xxl: '442px' } : {}}
    >
      <HStack
        w={'240px'}
        mx='auto'
        bg='grey.200'
        borderRadius='8px'
        py='2px'
        px={'2px'}
        mb={isMobile ? '16px' : '24px'}
      >
        <Button
          h={isMobile ? '28px' : '20px'}
          flex='1'
          py='2px'
          borderRadius='6px'
          bg={strategy === 'Buy' ? 'grey.50' : 'unset'}
          color='grey.800'
          _hover={{
            backgroundColor: strategy === 'Buy' ? 'grey.100' : 'rgba(255, 255, 255, 0.10)',
          }}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Buy selected',
              marketAddress: market?.address as Address,
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
          borderRadius='6px'
          py='2px'
          bg={strategy === 'Sell' ? 'grey.50' : 'unset'}
          color='grey.800'
          _hover={{
            backgroundColor: strategy === 'Sell' ? 'grey.100' : 'rgba(255, 255, 255, 0.10)',
          }}
          _disabled={{
            opacity: '50%',
            pointerEvents: 'none',
          }}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Sell selected',
              marketAddress: market?.address as Address,
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
      {strategy === 'Buy' && <MarketPageBuyForm setOutcomeIndex={setOutcomeIndex} />}
      {strategy === 'Sell' ? (
        status === 'Loading' ? (
          <LoadingForm outcomeIndex={outcomeIndex} />
        ) : (
          <SellForm setOutcomeIndex={setOutcomeIndex} />
        )
      ) : null}
    </Paper>
  )
}
