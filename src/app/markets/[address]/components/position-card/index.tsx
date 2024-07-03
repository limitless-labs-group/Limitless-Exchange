import Paper from '@/components/common-new/paper'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { HistoryPosition } from '@/services'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { NumberUtil } from '@/utils'
import { defaultChain } from '@/constants'

interface PositionCardProps {
  position: HistoryPosition
}

export default function PositionCard({ position }: PositionCardProps) {
  const getOutcomeNotation = () => {
    const outcomeTokenId = position.outcomeIndex ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return defaultOutcomes[outcomeTokenId]
  }

  const outcomeIcon = !position.outcomeIndex ? (
    <ThumbsUpIcon width={16} height={16} />
  ) : (
    <ThumbsDownIcon width={16} height={16} />
  )

  return (
    <Paper w='full'>
      <Flex justifyContent='space-between' mb='12px'>
        <HStack gap='4px'>
          {outcomeIcon}
          <Text fontWeight={500}>{getOutcomeNotation()}</Text>
        </HStack>
        <HStack gap='12px'>
          <Text fontWeight={500}>
            {`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} Contracts`}
          </Text>
        </HStack>
      </Flex>
      <HStack gap='24px'>
        <Box>
          <Text fontWeight={500} color='grey.500'>
            Invested
          </Text>
          <Text>{`${NumberUtil.toFixed(position.collateralAmount, 3)} ${
            position.market.collateral?.symbol
          }`}</Text>
        </Box>
        <Box>
          <Text fontWeight={500} color='grey.500'>
            Initial Price
          </Text>
          <Text>{`${NumberUtil.toFixed(position.latestTrade?.outcomeTokenPrice, 3)} ${
            position.market.collateral?.symbol
          }`}</Text>
        </Box>
        <Box>
          <Text fontWeight={500} color='grey.500'>
            Current Price
          </Text>
          <Text>{`${NumberUtil.toFixed(position.latestTrade?.outcomeTokenPrice, 3)} ${
            position.market.collateral?.symbol
          }`}</Text>
        </Box>
        <Box>
          <Text fontWeight={500} color='grey.500'>
            To Win
          </Text>
          <Text>
            {`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} ${
              position.market.collateral?.symbol
            }`}
          </Text>
        </Box>
      </HStack>
    </Paper>
  )
}
