import { defaultChain } from '@/constants'
import { StrategyChangedMetadata, ChangeEvent, useAmplitude, useTradingService } from '@/services'
import { Button, HStack, Text } from '@chakra-ui/react'
import { getAddress, zeroAddress } from 'viem'
import { Market, MarketGroup } from '@/types'

import { isMobile } from 'react-device-detect'
import { useState } from 'react'
import Paper from '@/components/common/paper'
import {
  BuyForm,
  SellForm,
  LoadingForm,
} from '@/app/(markets)/markets/[address]/components/trade-widgets'
import { controlsMedium } from '@/styles/fonts/fonts.styles'

interface MarketTradingFormProps {
  market: Market
  outcomeTokensPercent?: number[]
  setSelectedMarket?: (market: Market) => void
  marketGroup?: MarketGroup
}

export const MarketTradingForm = ({
  market,
  outcomeTokensPercent,
  marketGroup,
  setSelectedMarket,
}: MarketTradingFormProps) => {
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
  const marketAddress = getAddress(market?.address ?? zeroAddress)

  return (
    <Paper
      bg='blue.500'
      w={isMobile ? 'full' : '312px'}
      p={isMobile ? 0 : '8px'}
      maxH={isMobile ? '100dvh' : '545px'}
      overflowY='scroll'
      position='fixed'
      left='936px'
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
          bg={strategy === 'Buy' ? 'white' : 'unset'}
          color={strategy === 'Buy' ? 'black' : 'white'}
          _hover={{
            backgroundColor: strategy === 'Buy' ? 'white' : 'rgba(255, 255, 255, 0.30)',
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
          bg={strategy === 'Sell' ? 'white' : 'unset'}
          color={strategy === 'Sell' ? 'black' : 'white'}
          _hover={{
            backgroundColor: strategy === 'Sell' ? 'white' : 'rgba(255, 255, 255, 0.30)',
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
      {strategy === 'Buy' && (
        <BuyForm
          market={market}
          setOutcomeIndex={setOutcomeIndex}
          outcomeTokensPercent={outcomeTokensPercent}
          marketList={marketGroup?.markets}
          setSelectedMarket={setSelectedMarket}
        />
      )}
      {strategy === 'Sell' ? (
        status === 'Loading' ? (
          <LoadingForm market={market} outcomeIndex={outcomeIndex} />
        ) : (
          <SellForm
            market={market}
            setOutcomeIndex={setOutcomeIndex}
            setSelectedMarket={setSelectedMarket}
            marketGroup={marketGroup}
          />
        )
      ) : null}
    </Paper>
  )
}
