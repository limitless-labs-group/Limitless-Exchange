import { HStack, Text } from '@chakra-ui/react'
import React from 'react'
import { formatUnits } from 'viem'
import GemIcon from '@/resources/icons/gem-icon.svg'
import { ClobPositionWithType } from '@/services'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

interface RewardsSectionProps {
  position: ClobPositionWithType
}

export default function RewardsSection({ position }: RewardsSectionProps) {
  const getRewardsAmount = (size: string) =>
    formatUnits(BigInt(size), position.market.collateralToken.decimals)

  if (!position.rewards.isEarning || !position.rewards.epochs.length) {
    return null
  }

  return (
    <HStack gap='4px' color='whiteAlpha.70' flexWrap='wrap'>
      <GemIcon width={16} height={16} />
      <Text {...paragraphRegular} color='blue.500'>
        Rewards
      </Text>
      <Text {...paragraphRegular}>
        {Boolean(position.rewards.epochs.length)
          ? `${getRewardsAmount(position.rewards.epochs[0].userRewards)} ${
              position.market.collateralToken.symbol
            } / last min.`
          : ''}
      </Text>
      <Text {...paragraphRegular} color='grey.500'>
        {Boolean(position.rewards.epochs.length)
          ? `(${(position.rewards.epochs[0].earnedPercent * 100).toFixed(0)} % of max)`
          : ''}
      </Text>
    </HStack>
  )
}
