import { Box, Button, HStack, Text } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import useClobMarketShares from '@/hooks/use-clob-market-shares'
import { useOrderBook } from '@/hooks/use-order-book'
import { ChangeEvent, StrategyChangedMetadata, useAmplitude, useTradingService } from '@/services'
import { paragraphBold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface OutcomeButtonsClobProps {
  outcome: number
  setOutcome: (val: number) => void
}

export default function OutcomeButtonsClob({ outcome, setOutcome }: OutcomeButtonsClobProps) {
  const { strategy, market } = useTradingService()
  const { trackChanged } = useAmplitude()
  const { data: sharesOwned } = useClobMarketShares(market?.slug, market?.tokens)

  console.log(sharesOwned)

  const { data: orderBook } = useOrderBook(market?.slug)

  const { yesPrice, noPrice } = useMemo(() => {
    if (orderBook) {
      if (strategy === 'Buy') {
        const yesPrice = orderBook?.asks.sort((a, b) => a.price - b.price)[0]?.price * 100
        const noPrice = (1 - orderBook?.bids.sort((a, b) => b.price - a.price)[0]?.price) * 100
        return {
          yesPrice: isNaN(yesPrice) ? 0 : +yesPrice.toFixed(),
          noPrice: isNaN(noPrice) ? 0 : +noPrice.toFixed(),
        }
      }
      const yesPrice = orderBook?.bids.sort((a, b) => b.price - a.price)[0]?.price * 100
      const noPrice = (1 - orderBook?.asks.sort((a, b) => b.price - a.price)[0]?.price) * 100
      return {
        yesPrice: isNaN(yesPrice) ? 0 : +yesPrice.toFixed(),
        noPrice: isNaN(noPrice) ? 0 : +noPrice.toFixed(),
      }
    }
    return {
      yesPrice: 0,
      noPrice: 0,
    }
  }, [strategy, orderBook])

  const getShares = (sharesAmount: bigint) => {
    return formatUnits(sharesAmount, market?.collateralToken.decimals || 6)
  }

  const getTotalSharesPrice = (side: 'yes' | 'no', sharesAmount?: bigint) => {
    if (!sharesAmount) {
      return ''
    }
    const shares = getShares(sharesAmount)
    return new BigNumber(shares).multipliedBy(side === 'yes' ? yesPrice : noPrice).toString()
  }

  const handleOutcomeChanged = (outcome: number) => {
    trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
      type: 'Buy selected',
      marketAddress: market?.slug as string,
    })
    setOutcome(outcome)
  }

  const yesAmountUSDC = 12341.123

  const yesContracts = 2345

  const noAmountUSDC = 12412.123

  const noContracts = 4321

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
          px='12px'
          py='8px'
          alignItems='flex-start'
        >
          <HStack w='full' justifyContent='space-between'>
            <Text {...paragraphBold} color={!outcome ? 'white' : 'black'}>
              Yes
            </Text>
            <Text {...paragraphBold} color={!outcome ? 'white' : 'black'}>
              {NumberUtil.formatThousands(getTotalSharesPrice('yes', sharesOwned?.[0]), 2)}{' '}
              {market?.collateralToken.symbol}
            </Text>
          </HStack>
          <Text {...paragraphRegular} color={!outcome ? 'white' : 'grey.500'}>
            {NumberUtil.convertWithDenomination(yesContracts, 6)} Contracts
          </Text>
        </Button>
        <Button
          flex={1}
          color={outcome ? 'white' : 'red.500'}
          bg={outcome ? 'red.500' : 'redTransparent.100'}
          onClick={() => handleOutcomeChanged(1)}
          h='64px'
          flexDirection='column'
          px='12px'
          py='8px'
          alignItems='flex-start'
        >
          <HStack w='full' justifyContent='space-between'>
            <Text {...paragraphBold} color={outcome ? 'white' : 'black'}>
              No
            </Text>
            <Text {...paragraphBold} color={outcome ? 'white' : 'black'}>
              {NumberUtil.formatThousands(noAmountUSDC, 2)} {market?.collateralToken.symbol}
            </Text>
          </HStack>
          <Text {...paragraphRegular} color={outcome ? 'white' : 'grey.500'}>
            {NumberUtil.convertWithDenomination(noContracts, 6)} Contracts
          </Text>
        </Button>
      </HStack>
    </Box>
  )
}
