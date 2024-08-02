import Paper from '@/components/common/paper'
import { Flex, HStack, Text } from '@chakra-ui/react'
import { HistoryPosition } from '@/services'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { NumberUtil } from '@/utils'
import { Market } from '@/types'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { defaultChain } from '@/constants'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

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

  const currentContractsPrice =
    +(position.outcomeTokenAmount || 1) * ((market?.prices[position.outcomeIndex] || 1) / 100)

  const contractPrice = currentContractsPrice / +(position?.collateralAmount || 1)

  const contractPriceChanged = useMemo(() => {
    let price
    if (contractPrice < 1) {
      price = NumberUtil.toFixed((1 - contractPrice) * 100, 0)
    } else {
      price = NumberUtil.toFixed((contractPrice - 1) * 100, 0)
    }
    if (contractPrice < 1) {
      return (
        <Text {...paragraphMedium} color='red.500'>
          &#x2193;
          {price}%
        </Text>
      )
    }
    return (
      <Text {...paragraphMedium} color='green.500'>
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
          <Text {...paragraphMedium}>{getOutcomeNotation()}</Text>
        </HStack>
        <HStack gap='12px'>
          {!isMobile && (
            <Text {...paragraphMedium}>
              {`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} Contracts`}
            </Text>
          )}
          <HStack gap='4px'>
            <Text {...paragraphMedium}>{`${NumberUtil.toFixed(currentContractsPrice, 6)} ${
              market?.tokenTicker[defaultChain.id]
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
          <Flex flexDir={'row'} justifyContent={isMobile ? 'space-between' : 'unset'} w={'full'}>
            <Text {...paragraphMedium} color='grey.500'>
              Contracts
            </Text>
            <Text {...paragraphRegular}>{NumberUtil.toFixed(position.outcomeTokenAmount, 6)}</Text>
          </Flex>
        )}
        <Flex
          flexDir={isMobile ? 'row' : 'column'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Text {...paragraphMedium} color='grey.500'>
            Invested
          </Text>
          <Text {...paragraphRegular}>{`${NumberUtil.toFixed(position.collateralAmount, 4)} ${
            market?.tokenTicker[defaultChain.id]
          }`}</Text>
        </Flex>
        <Flex
          flexDir={isMobile ? 'row' : 'column'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Text {...paragraphMedium} color='grey.500'>
            Initial Price
          </Text>
          <Text {...paragraphRegular}>{`${NumberUtil.toFixed(
            position.latestTrade?.outcomeTokenPrice,
            3
          )} ${market?.tokenTicker[defaultChain.id]}`}</Text>
        </Flex>
        <Flex
          flexDir={isMobile ? 'row' : 'column'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Text {...paragraphMedium} color='grey.500'>
            Current Price
          </Text>
          <Text {...paragraphRegular}>{`${NumberUtil.toFixed(
            (market?.prices[position.outcomeIndex] || 1) / 100,
            3
          )} ${market?.tokenTicker[defaultChain.id]}`}</Text>
        </Flex>
        <Flex
          flexDir={isMobile ? 'row' : 'column'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Text {...paragraphMedium} color='grey.500'>
            To Win
          </Text>
          <Text {...paragraphRegular}>
            {`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} ${
              market?.tokenTicker[defaultChain.id]
            }`}
          </Text>
        </Flex>
      </HStack>
    </Paper>
  )
}
