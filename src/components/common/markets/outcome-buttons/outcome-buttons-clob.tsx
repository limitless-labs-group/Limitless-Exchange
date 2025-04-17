import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { formatUnits } from 'viem'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import { blockTradeAtom } from '@/atoms/trading'
import {
  ChangeEvent,
  OrderBookSideChangedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketOrderType } from '@/types'

export default function OutcomeButtonsClob() {
  const { strategy, market, clobOutcome: outcome, setClobOutcome: setOutcome } = useTradingService()
  const { trackChanged } = useAmplitude()
  const { orderType, yesPrice, noPrice } = useClobWidget()
  const [, setTradingBlocked] = useAtom(blockTradeAtom)

  const getShares = (sharesAmount?: bigint) => {
    if (!sharesAmount) {
      return ''
    }
    return formatUnits(sharesAmount, market?.collateralToken.decimals || 6)
  }

  const handleOutcomeChanged = (outcome: number) => {
    trackChanged<OrderBookSideChangedMetadata>(ChangeEvent.OrderBookSideChanged, {
      type: outcome ? 'No selected' : 'Yes selected',
      marketAddress: market?.slug as string,
    })
    setOutcome(outcome)
    setTradingBlocked(false)
    if (orderType === MarketOrderType.LIMIT) {
      const selectedPrice = outcome ? 100 - yesPrice : 100 - noPrice
      // setPrice(selectedPrice === 0 ? '' : String(selectedPrice))
    }
  }

  console.log(noPrice)

  return (
    <Box mb='24px'>
      <Text {...paragraphMedium} mb='8px'>
        Select outcome
      </Text>
      <HStack w='full' gap='8px'>
        <Button
          flex={1}
          color={!outcome ? 'white' : 'green.500'}
          bg={!outcome ? 'green.500' : 'greenTransparent.100'}
          onClick={() => handleOutcomeChanged(0)}
          h='64px'
          flexDirection='column'
          p='12px'
          alignItems='flex-start'
        >
          <VStack w='full' justifyContent='space-between' gap={0}>
            <Text color={!outcome ? 'white' : 'green.500'} fontSize='16px' fontWeight={700}>
              Yes {yesPrice}¢
            </Text>
            <Text {...paragraphRegular} color={!outcome ? 'white' : 'green.500'}>
              {/*{NumberUtil.toFixed(getShares(sharesAvailable['yes']), 2)} Contracts*/}
            </Text>
          </VStack>
        </Button>
        <Button
          flex={1}
          color={outcome ? 'white' : 'red.500'}
          bg={outcome ? 'red.500' : 'redTransparent.100'}
          onClick={() => handleOutcomeChanged(1)}
          h='64px'
          flexDirection='column'
          p='12px'
          alignItems='flex-start'
        >
          <VStack w='full' justifyContent='space-between' gap={0}>
            <Text color={outcome ? 'white' : 'red.500'} fontSize='16px' fontWeight={700}>
              No {noPrice}¢
            </Text>
            <Text {...paragraphRegular} color={outcome ? 'white' : 'red.500'}>
              {/*{NumberUtil.toFixed(getShares(sharesAvailable['no']), 2)} Contracts*/}
            </Text>
          </VStack>
        </Button>
      </HStack>
    </Box>
  )
}
