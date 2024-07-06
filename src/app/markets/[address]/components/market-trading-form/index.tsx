import { Button } from '@/components'
import { defaultChain } from '@/constants'
import { StrategyChangedMetadata, ChangeEvent, useAmplitude, useTradingService } from '@/services'
import { HStack, Text } from '@chakra-ui/react'
import { getAddress, zeroAddress } from 'viem'
import { Market } from '@/types'
import Paper from '@/components/common-new/paper'
import { isMobile } from 'react-device-detect'
import BuyForm from '@/app/markets/[address]/components/market-trading-form/components/buy-form'
import SellForm from '@/app/markets/[address]/components/market-trading-form/components/sell-form'
import LoadingForm from 'src/app/markets/[address]/components/market-trading-form/components/loading-form'
import { useState } from 'react'

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
  const { strategy, setStrategy, status, trade } = useTradingService()

  /**
   * MARKET DATA
   */
  const marketAddress = getAddress(market?.address[defaultChain.id] ?? zeroAddress)

  return (
    <Paper bg='blue.500' w={isMobile ? 'full' : '296px'} p={isMobile ? 0 : '8px'}>
      <HStack
        w={'240px'}
        mx='auto'
        bg='rgba(255, 255, 255, 0.20)'
        borderRadius='2px'
        p='2px'
        mb='24px'
      >
        <Button
          h={isMobile ? '28px' : 'unset'}
          flex='1'
          borderRadius='2px'
          bg={strategy === 'Buy' ? 'white' : 'unset'}
          color={strategy === 'Buy' ? 'black' : 'white'}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Buy selected',
              marketAddress,
            })
            setStrategy('Buy')
          }}
        >
          <Text fontWeight={'bold'} color={strategy == 'Buy' ? 'font' : 'fontLight'}>
            Buy
          </Text>
        </Button>
        <Button
          h={isMobile ? '28px' : 'unset'}
          flex='1'
          borderRadius='2px'
          bg={strategy === 'Sell' ? 'white' : 'unset'}
          color={strategy === 'Sell' ? 'black' : 'white'}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Sell selected',
              marketAddress,
            })
            setStrategy('Sell')
          }}
        >
          <Text fontWeight={'bold'} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
            Sell
          </Text>
        </Button>
      </HStack>
      {status !== 'Loading' ? (
        <>
          {strategy === 'Buy' ? (
            <BuyForm market={market} setOutcomeIndex={setOutcomeIndex} />
          ) : (
            <SellForm market={market} setOutcomeIndex={setOutcomeIndex} />
          )}
        </>
      ) : (
        <LoadingForm market={market} outcomeIndex={outcomeIndex} />
      )}
    </Paper>
  )
}
