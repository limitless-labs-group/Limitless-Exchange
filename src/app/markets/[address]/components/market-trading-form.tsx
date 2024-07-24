import { defaultChain } from '@/constants'
import { StrategyChangedMetadata, ChangeEvent, useAmplitude, useTradingService } from '@/services'
import { Button, HStack, Text } from '@chakra-ui/react'
import { getAddress, zeroAddress } from 'viem'
import { Market } from '@/types'

import { isMobile } from 'react-device-detect'
import { useState } from 'react'
import Paper from '@/components/common/paper'
import { BuyForm, SellForm, LoadingForm } from '@/app/markets/[address]/components/trade-widgets'
import { controlsMedium } from '@/styles/fonts/fonts.styles'

interface MarketTradingFormProps {
  market: Market
}

export const MarketTradingForm = ({ market }: MarketTradingFormProps) => {
  const [outcomeIndex, setOutcomeIndex] = useState(0)
  /**
   * ANALITYCS
   */
  const { trackChanged } = useAmplitude()

  /**
   * TRADING SERVICE
   */
  const { strategy, setStrategy, status } = useTradingService()

  /**
   * MARKET DATA
   */
  const marketAddress = getAddress(market?.address[defaultChain.id] ?? zeroAddress)

  return (
    <Paper
      bg='blue.500'
      w={isMobile ? 'full' : '312px'}
      p={isMobile ? 0 : '8px'}
      overflow={isMobile ? 'unset' : 'hidden'}
    >
      <HStack
        w={'240px'}
        mx='auto'
        bg='rgba(255, 255, 255, 0.20)'
        borderRadius='2px'
        py='2px'
        px={isMobile ? '4px' : '2px'}
        mb={isMobile ? '32px' : '24px'}
      >
        <Button
          h={isMobile ? '28px' : '20px'}
          flex='1'
          py='2px'
          borderRadius='2px'
          bg={strategy === 'Buy' ? 'grey.50' : 'unset'}
          color={strategy === 'Buy' ? 'grey.800' : 'grey.50'}
          _hover={{
            backgroundColor: strategy === 'Buy' ? 'grey.50' : 'rgba(255, 255, 255, 0.30)',
          }}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Buy selected',
              marketAddress,
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
          borderRadius='2px'
          py='2px'
          bg={strategy === 'Sell' ? 'grey.50' : 'unset'}
          color={strategy === 'Sell' ? 'grey.800' : 'grey.50'}
          _hover={{
            backgroundColor: strategy === 'Sell' ? 'grey.50' : 'rgba(255, 255, 255, 0.30)',
          }}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Sell selected',
              marketAddress,
            })
            setStrategy('Sell')
          }}
        >
          <Text {...controlsMedium} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
            Sell
          </Text>
        </Button>
      </HStack>
      {strategy === 'Buy' && <BuyForm market={market} setOutcomeIndex={setOutcomeIndex} />}
      {strategy === 'Sell' ? (
        status === 'Loading' ? (
          <LoadingForm market={market} outcomeIndex={outcomeIndex} />
        ) : (
          <SellForm market={market} setOutcomeIndex={setOutcomeIndex} />
        )
      ) : null}
    </Paper>
  )
}
