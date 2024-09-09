import { useHistory } from '@/services'
import { Text, Button, Box } from '@chakra-ui/react'
import { useMemo } from 'react'
import { Market } from '@/types'

import { useRouter } from 'next/navigation'
import Paper from '@/components/common/paper'

interface MarketClaimingFormProps {
  market: Market | null
}

export const MarketClaimingForm: React.FC<MarketClaimingFormProps> = ({ market }) => {
  // const { status } = useTradingService()
  // const { trackClicked } = useAmplitude()
  const { positions } = useHistory()
  const router = useRouter()
  const positionToClaim = useMemo(
    () =>
      positions?.filter(
        (position) =>
          position.market.id.toLowerCase() === market?.address.toLowerCase() &&
          position.outcomeIndex === market.winningOutcomeIndex &&
          market.expired
      )?.[0],
    [positions, market]
  )

  const hasPositions = useMemo(() => {
    return positions?.filter(
      (position) =>
        market?.expired && position.market.id.toLowerCase() === market?.address.toLowerCase()
    )
  }, [market?.address, market?.expired, positions])

  // const formColor = useMemo(() => {
  //   if (!positionToClaim) {
  //     return 'black'
  //   }
  //   if (hasPositions) {
  //     return 'green.500'
  //   }
  //   return 'red.500'
  // }, [positionToClaim, hasPositions])

  // const actionText = useMemo(() => {
  //   if (!positionToClaim) {
  //     return (
  //       <Button variant='white' onClick={() => router.push('/')}>
  //         Explore Open Markets
  //       </Button>
  //     )
  //   }
  //   if (positionToClaim) {
  //     return (
  //       <Button
  //         variant='white'
  //         onClick={() => {
  //           trackClicked(ClickEvent.ClaimRewardOnMarketPageClicked, {
  //             platform: 'desktop',
  //             marketAddress: market?.address,
  //           })
  //
  //           // return claim(positionToClaim.outcomeIndex)
  //         }}
  //         isDisabled={status === 'Loading'}
  //       >
  //         {status === 'Loading' ? (
  //           'Processing'
  //         ) : (
  //           <>
  //             <Icon as={WinIcon} />
  //             Claim {NumberUtil.formatThousands(positionToClaim.outcomeTokenAmount, 4)}
  //             {market?.collateralToken.symbol}
  //           </>
  //         )}
  //       </Button>
  //     )
  //   }
  //   if (hasPositions) {
  //     return (
  //       <Text color='grey.50'>
  //         You lost {`${NumberUtil.formatThousands(hasPositions[0].outcomeTokenAmount, 4)}`}{' '}
  //         {market?.collateralToken.symbol}
  //       </Text>
  //     )
  //   }
  // }, [hasPositions, market?.collateralToken.symbol, positionToClaim, router, status])

  return (
    // <Paper bg={formColor} w='312px'>
    <Paper bg='black' w='312px'>
      <Text fontWeight={500} color='white'>
        Market is closed
      </Text>
      {/*{!!hasPositions?.length && (*/}
      {/*  <HStack gap='4px' color='white'>*/}
      {/*    <Text fontWeight={500}>Your prediction of</Text>*/}
      {/*    {hasPositions[0].outcomeIndex ? (*/}
      {/*      <ThumbsDownIcon width={16} height={16} />*/}
      {/*    ) : (*/}
      {/*      <ThumbsUpIcon width={16} height={16} />*/}
      {/*    )}*/}
      {/*    <Text fontWeight={500}>{hasPositions[0].outcomeIndex ? 'No' : 'Yes'}</Text>*/}
      {/*    <Text fontWeight={500}>*/}
      {/*      did {hasPositions[0].outcomeIndex === market?.winningOutcomeIndex ? '' : 'not '} come*/}
      {/*      true*/}
      {/*    </Text>*/}
      {/*  </HStack>*/}
      {/*)}*/}
      {/*<Box mt='104px'>{actionText}</Box>*/}
      <Box mt='104px'>
        <Button variant='white' onClick={() => router.push('/markets')}>
          Explore Open Markets
        </Button>
      </Box>
    </Paper>
  )
}
