import Paper from '@/components/common/paper'
import { Flex, HStack, Text } from '@chakra-ui/react'
import { HistoryPosition } from '@/services'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { NumberUtil } from '@/utils'
import { Market } from '@/types'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'

interface PositionCardProps {
  position: HistoryPosition
  market: Market | null
}

export function PositionCard({ position, market }: PositionCardProps) {
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

  const contractPrice =
    (+(position.latestTrade?.outcomeTokenPrice || 0) /
      (market?.prices[position.outcomeIndex] || 1)) *
    100

  const currentContractsPrice = +(position.collateralAmount || 0) * contractPrice

  const contractPriceChanged = useMemo(() => {
    let price
    if (contractPrice < 1) {
      price = NumberUtil.toFixed((1 - contractPrice) * 100, 0)
    } else {
      price = NumberUtil.toFixed((contractPrice - 1) * 100, 0)
    }
    if (contractPrice < 1) {
      return (
        <Text color='red.500'>
          &#x2193;
          {price}%
        </Text>
      )
    }
    return (
      <Text color='green.500'>
        &#x2191;
        {price}%
      </Text>
    )
  }, [contractPrice])

  return (
    <Paper w='full'>
      <Flex justifyContent='space-between' mb='12px'>
        <HStack gap='4px'>
          {outcomeIcon}
          <Text fontWeight={500}>{getOutcomeNotation()}</Text>
        </HStack>
        <HStack gap='12px'>
          {!isMobile && (
            <Text fontWeight={500}>
              {`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} Contracts`}
            </Text>
          )}
          <HStack gap='4px'>
            <Text fontWeight={500}>{`${NumberUtil.toFixed(currentContractsPrice, 6)} ${
              position.market.collateral?.symbol
            }`}</Text>
            {contractPriceChanged}
          </HStack>
        </HStack>
      </Flex>
      <HStack
        gap={isMobile ? '8px' : '24px'}
        flexDir={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'center'}
      >
        {isMobile && (
          <Flex
            flexDir={isMobile ? 'row' : 'column'}
            justifyContent={isMobile ? 'space-between' : 'unset'}
            w={isMobile ? 'full' : 'unset'}
          >
            <Text fontWeight={500} color='grey.500'>
              Contracts
            </Text>
            <Text>{NumberUtil.toFixed(position.outcomeTokenAmount, 6)}</Text>
          </Flex>
        )}
        <Flex
          flexDir={isMobile ? 'row' : 'column'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Text fontWeight={500} color='grey.500'>
            Invested
          </Text>
          <Text>{`${NumberUtil.toFixed(position.collateralAmount, 3)} ${
            position.market.collateral?.symbol
          }`}</Text>
        </Flex>
        <Flex
          flexDir={isMobile ? 'row' : 'column'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Text fontWeight={500} color='grey.500'>
            Initial Price
          </Text>
          <Text>{`${NumberUtil.toFixed(position.latestTrade?.outcomeTokenPrice, 3)} ${
            position.market.collateral?.symbol
          }`}</Text>
        </Flex>
        <Flex
          flexDir={isMobile ? 'row' : 'column'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Text fontWeight={500} color='grey.500'>
            Current Price
          </Text>
          <Text>{`${NumberUtil.toFixed((market?.prices[position.outcomeIndex] || 1) / 100, 3)} ${
            position.market.collateral?.symbol
          }`}</Text>
        </Flex>
        <Flex
          flexDir={isMobile ? 'row' : 'column'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Text fontWeight={500} color='grey.500'>
            To Win
          </Text>
          <Text>
            {`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} ${
              position.market.collateral?.symbol
            }`}
          </Text>
        </Flex>
      </HStack>
    </Paper>
  )
}
