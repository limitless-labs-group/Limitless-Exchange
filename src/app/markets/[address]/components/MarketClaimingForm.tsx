import { Button } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { useHistory, useTradingService } from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import { Stack, StackProps, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { FaRegCheckCircle } from 'react-icons/fa'

export const MarketClaimingForm = ({ ...props }: StackProps) => {
  const { market, redeem: claim, status } = useTradingService()
  const { positions } = useHistory()
  const positionToClaim = useMemo(
    () =>
      positions?.filter(
        (position) =>
          position.market.id === market?.address[defaultChain.id].toLowerCase() &&
          position.outcomeIndex === market.winningOutcomeIndex &&
          market.expired
      )?.[0],
    [positions, market]
  )

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      p={5}
      border={`1px solid ${colors.border}`}
      borderRadius={borderRadius}
      alignItems={'center'}
      spacing={3}
      {...props}
    >
      <FaRegCheckCircle
        size={'30px'}
        fill={market?.winningOutcomeIndex == 0 ? colors.green : colors.red}
      />
      <Text fontWeight={'bold'} color={market?.winningOutcomeIndex == 0 ? 'green' : 'red'}>
        Outcome: {market?.outcomeTokens[market.winningOutcomeIndex ?? 0]}
      </Text>

      {positionToClaim && (
        <Stack w={'full'} alignItems={'center'} spacing={3}>
          <Text>
            You won {NumberUtil.toFixed(positionToClaim.outcomeTokenAmount, 6)}{' '}
            {collateralToken.symbol} 🎉
          </Text>
          <Button
            bg={'brand'}
            color={'white'}
            w={'full'}
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
