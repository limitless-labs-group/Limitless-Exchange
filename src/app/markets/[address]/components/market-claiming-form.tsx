import { defaultChain } from '@/constants'
import { useHistory, useTradingService } from '@/services'
import { colors } from '@/styles'
import { NumberUtil } from '@/utils'
import { Stack, Text, Button } from '@chakra-ui/react'
import { useMemo } from 'react'
import { FaRegCheckCircle } from 'react-icons/fa'
import { Market } from '@/types'

interface MarketClaimingFormProps {
  market: Market | null
}

export const MarketClaimingForm: React.FC<MarketClaimingFormProps> = ({ market }) => {
  const { redeem: claim, status } = useTradingService()
  const { positions } = useHistory()
  const positionToClaim = useMemo(
    () =>
      positions?.filter(
        (position) =>
          position.market.id.toLowerCase() === market?.address[defaultChain.id].toLowerCase() &&
          position.outcomeIndex === market.winningOutcomeIndex &&
          market.expired
      )?.[0],
    [positions, market]
  )

  return (
    <Stack h={'fit-content'} w='312px' p={5} bg='blue.500' alignItems={'center'} spacing={3}>
      <FaRegCheckCircle
        size={'30px'}
        fill={market?.winningOutcomeIndex == 0 ? colors.green : colors.red}
      />
      <Text
        fontWeight={'bold'}
        color={market?.winningOutcomeIndex == 0 ? colors.green : colors.red}
      >
        Outcome: {market?.outcomeTokens[market?.winningOutcomeIndex ?? 0]}
      </Text>

      {positionToClaim && (
        <Stack w={'full'} alignItems={'center'} spacing={3}>
          <Text color='white'>
            You won {NumberUtil.toFixed(positionToClaim.outcomeTokenAmount, 6)}{' '}
            {market?.tokenTicker[defaultChain.id]} 🎉
          </Text>
          <Button
            variant='contained'
            w={'full'}
            bg='white'
            color='black'
            isLoading={status == 'Loading'}
            isDisabled={!positionToClaim}
            onClick={() => claim(positionToClaim.outcomeIndex)}
          >
            Claim
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
