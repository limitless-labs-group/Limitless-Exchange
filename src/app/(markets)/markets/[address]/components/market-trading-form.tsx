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
  useHistory,
} from '@/services'
import { controlsMedium, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup } from '@/types'

interface MarketTradingFormProps {
  market: Market
  setSelectedMarket?: (market: Market) => void
  marketGroup?: MarketGroup
  analyticParams?: { quickBetSource: string; source: string }
  showTitle?: boolean
}

export const MarketTradingForm = ({
  market,
  marketGroup,
  setSelectedMarket,
  analyticParams,
  showTitle = false,
}: MarketTradingFormProps) => {
  const [outcomeIndex, setOutcomeIndex] = useState(0)
  /**
   * ANALITYCS
   */
  const { trackChanged } = useAmplitude()

  const { positions: allMarketsPositions } = useHistory()

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
      allMarketsPositions?.filter(
        (position) => position.market.id.toLowerCase() === market?.address?.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  const widgetPosition = useMemo(() => {
    if (isMobile) {
      return 'relative'
    }
    if (showTitle) {
      return 'unset'
    }
    return 'fixed'
  }, [showTitle, isMobile])

  useEffect(() => {
    setStrategy('Buy')
  }, [])

  return (
    <Paper
      bg='blue.500'
      w={isMobile ? 'full' : '312px'}
      p={isMobile ? 0 : '8px'}
      h={isMobile ? '100dvh' : 'unset'}
      overflowY='scroll'
      position={widgetPosition}
      left={isMobile ? 0 : '936px'}
    >
      {showTitle && (
        <Text {...paragraphMedium} mb='24px' textAlign='center' color='white'>
          {market?.proxyTitle ?? market?.title}
        </Text>
      )}
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
              ...(analyticParams ? analyticParams : {}),
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
              ...(analyticParams ? analyticParams : {}),
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
          marketList={marketGroup?.markets}
          setSelectedMarket={setSelectedMarket}
          analyticParams={analyticParams}
        />
      )}
      {strategy === 'Sell' ? (
        status === 'Loading' ? (
          <LoadingForm outcomeIndex={outcomeIndex} />
        ) : (
          <Box mx={isMobile ? '16px' : 0}>
            <SellForm
              setOutcomeIndex={setOutcomeIndex}
              setSelectedMarket={setSelectedMarket}
              marketGroup={marketGroup}
              analyticParams={analyticParams}
            />
          </Box>
        )
      ) : null}
    </Paper>
  )
}
