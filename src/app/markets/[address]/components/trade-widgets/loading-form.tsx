import { Spinner, VStack, Text, HStack } from '@chakra-ui/react'
import { useTradingService } from '@/services'
import { Market } from '@/types'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { defaultChain } from '@/constants'

interface LoadingFormProps {
  market: Market
  outcomeIndex: number
}

export function LoadingForm({ market, outcomeIndex }: LoadingFormProps) {
  const { strategy, collateralAmount } = useTradingService()

  return (
    <VStack my='40px' w='full'>
      <Spinner color='grey.50' size='lg' emptyColor='rgba(255, 255, 255, 0.2)' />
      <Text fontWeight={500} color='grey.50'>
        You&lsquo;re {strategy === 'Buy' ? 'buying' : 'selling'}
      </Text>
      <HStack gap='4px' color='grey.50'>
        {outcomeIndex ? (
          <ThumbsDownIcon width={16} height={16} />
        ) : (
          <ThumbsUpIcon width={16} height={16} />
        )}
        <Text fontWeight={500}>{outcomeIndex ? 'No' : 'Yes'} Contracts</Text>
      </HStack>
      <Text fontWeight={500} color='grey.50'>
        For {collateralAmount} {market.tokenTicker[defaultChain.id]}
      </Text>
    </VStack>
  )
}
