import { Spinner, VStack, Text, HStack } from '@chakra-ui/react'
import { useTradingService } from '@/services'
import { Market } from '@/types'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { useMemo } from 'react'
import { NumberUtil } from '@/utils'

interface LoadingFormProps {
  market: Market
  outcomeIndex: number
}

export function LoadingForm({ market, outcomeIndex }: LoadingFormProps) {
  const { strategy, collateralAmount } = useTradingService()

  const amount = useMemo(() => {
    return NumberUtil.toFixed(collateralAmount, 6)
  }, [])

  return (
    <VStack my='40px' w='full'>
      <Spinner color='white' size='lg' emptyColor='rgba(255, 255, 255, 0.2)' />
      <Text fontWeight={500} color='white'>
        You&lsquo;re {strategy === 'Buy' ? 'buying' : 'selling'}
      </Text>
      <HStack gap='4px' color='white'>
        {outcomeIndex ? (
          <ThumbsDownIcon width={16} height={16} />
        ) : (
          <ThumbsUpIcon width={16} height={16} />
        )}
        <Text fontWeight={500}>{outcomeIndex ? 'No' : 'Yes'} Contracts</Text>
      </HStack>

      <Text fontWeight={500} color='white'>
        For {amount} {market.collateralToken.symbol}
      </Text>
    </VStack>
  )
}
