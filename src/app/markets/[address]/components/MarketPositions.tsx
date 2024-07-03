import { defaultChain } from '@/constants'
import { HistoryPosition, useHistory, useTradingService } from '@/services'
import { NumberUtil } from '@/utils'
import {
  Box,
  Divider,
  Flex,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Market } from '@/types'
import ChartIcon from '@/resources/icons/chart-icon.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'

interface MarketPositionsProps {
  market: Market | null
}

export const MarketPositions = ({ market }: MarketPositionsProps) => {
  const { positions: allMarketsPositions } = useHistory()

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) =>
          position.market.id.toLowerCase() === market?.address[defaultChain.id].toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  const getOutcomeNotation = (position: HistoryPosition) => {
    const outcomeTokenId = position.outcomeIndex ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return market?.outcomeTokens[outcomeTokenId] ?? defaultOutcomes[outcomeTokenId]
  }

  return Number(positions?.length) > 0 ? (
    <Flex mt='24px' justifyContent='space-between'>
      <HStack color='grey.800' gap='4px'>
        <ChartIcon width='16px' height='16px' />
        <Text fontWeight={700}>Portfolio</Text>
      </HStack>
      <HStack color='grey.800' gap='4px'>
        <Text fontWeight={700}>USD</Text>
        <ChevronDownIcon width='16px' height='16px' />
      </HStack>
    </Flex>
  ) : (
    <></>
  )
}
