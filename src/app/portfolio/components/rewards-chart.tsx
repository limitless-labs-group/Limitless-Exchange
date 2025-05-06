import { Box, HStack, Text } from '@chakra-ui/react'
import React from 'react'
import { formatUnits } from 'viem'
import Paper from '@/components/common/paper'
import RewardsChartDiagram from '@/app/portfolio/components/rewards-chart-diagram'
import GemIcon from '@/resources/icons/gem-icon.svg'
import { usePosition } from '@/services'
import { h3Medium, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function RewardsChart() {
  const { data: positions } = usePosition()

  const totalRewards = positions
    ? formatUnits(BigInt(positions.rewards.totalUnpaidRewards), 6)
    : '0.00'
  const lastMinuteRewards = positions
    ? formatUnits(BigInt(positions.rewards.totalUserRewardsLastEpoch), 6)
    : '0.00'

  return (
    <Paper mt='12px' p='16px'>
      <HStack gap='8px' mb='12px'>
        <GemIcon width={16} height={16} />
        <Text {...paragraphMedium} color='grey.500'>
          Today’s rewards
        </Text>
      </HStack>
      <HStack gap='4px' alignItems='flex-end'>
        <Text {...h3Medium}>{NumberUtil.convertWithDenomination(totalRewards)} USD</Text>
        <HStack gap='4px' mb='2px'>
          <Text {...paragraphMedium} color='green.500'>
            +{NumberUtil.convertWithDenomination(lastMinuteRewards, 2)} USD &#x2191;
          </Text>
          <Text {...paragraphMedium} color='grey.500'>
            last minute
          </Text>
        </HStack>
      </HStack>
      <Box mt='32px'>
        <RewardsChartDiagram />
      </Box>
    </Paper>
  )
}
