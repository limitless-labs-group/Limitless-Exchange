import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { formatUnits } from 'viem'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import { ChangeEvent, StrategyChangedMetadata, useAmplitude, useTradingService } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function OutcomeButtonsClob() {
  const { strategy, market } = useTradingService()
  const { trackChanged } = useAmplitude()
  const { outcome, setOutcome, setPrice, yesPrice, noPrice, sharesAvailable } = useClobWidget()

  const getShares = (sharesAmount?: bigint) => {
    if (!sharesAmount) {
      return ''
    }
    return formatUnits(sharesAmount, market?.collateralToken.decimals || 6)
  }

  const handleOutcomeChanged = (outcome: number) => {
    trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
      type: 'Buy selected',
      marketAddress: market?.slug as string,
    })
    setOutcome(outcome)
    setPrice('')
  }

  if (strategy === 'Buy') {
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
          >
            Yes {yesPrice}¢
          </Button>
          <Button
            flex={1}
            color={outcome ? 'white' : 'red.500'}
            bg={outcome ? 'red.500' : 'redTransparent.100'}
            onClick={() => handleOutcomeChanged(1)}
            h='64px'
          >
            No {noPrice}¢
          </Button>
        </HStack>
      </Box>
    )
  }

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
              {NumberUtil.toFixed(getShares(sharesAvailable['yes']), 6)} Contracts
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
              {NumberUtil.toFixed(getShares(sharesAvailable['no']), 6)} Contracts
            </Text>
          </VStack>
        </Button>
      </HStack>
    </Box>
  )
}
