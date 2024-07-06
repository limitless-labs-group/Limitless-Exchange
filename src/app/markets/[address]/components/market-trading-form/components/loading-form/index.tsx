import {
  CircularProgress,
  CircularProgressLabel,
  Spinner,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import Loader from '@web3auth/ui/dist/types/components/Loader'
import { useTradingService } from '@/services'
import { Market } from '@/types'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { defaultChain } from '@/constants'

interface LoadingFormProps {
  market: Market
  outcomeIndex: number
}

export default function LoadingForm({ market, outcomeIndex }: LoadingFormProps) {
  const { strategy, collateralAmount } = useTradingService()

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
        For {collateralAmount} {market.tokenTicker[defaultChain.id]}
      </Text>
    </VStack>
  )
}
