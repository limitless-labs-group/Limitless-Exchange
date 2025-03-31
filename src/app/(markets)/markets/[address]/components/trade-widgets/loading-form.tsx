import { Spinner, VStack, Text, HStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import { useTradingService } from '@/services'
import { NumberUtil } from '@/utils'

interface LoadingFormProps {
  outcomeIndex: number
}

export function LoadingForm({ outcomeIndex }: LoadingFormProps) {
  const { strategy, collateralAmount, market } = useTradingService()

  const amount = useMemo(() => {
    return NumberUtil.toFixed(collateralAmount, 6)
  }, [])

  return (
    <VStack my='40px' w='full'>
      <Spinner
        color='var(--chakra-colors-grey-800)'
        size='lg'
        emptyColor='rgba(255, 255, 255, 0.2)'
      />
      <Text fontWeight={500} color='var(--chakra-colors-grey-800)'>
        You&lsquo;re {strategy === 'Buy' ? 'buying' : 'selling'}
      </Text>
      <HStack gap='4px' color='var(--chakra-colors-grey-800)'>
        {outcomeIndex ? (
          <ThumbsDownIcon width={16} height={16} />
        ) : (
          <ThumbsUpIcon width={16} height={16} />
        )}
        <Text fontWeight={500}>{outcomeIndex ? 'No' : 'Yes'} Contracts</Text>
      </HStack>

      <Text fontWeight={500} color='var(--chakra-colors-grey-800)'>
        For {amount} {market?.collateralToken.symbol}
      </Text>
    </VStack>
  )
}
