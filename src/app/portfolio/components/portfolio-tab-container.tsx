import { Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import Skeleton from '@/components/common/skeleton'
import PortfolioPositionCard from '@/app/portfolio/components/PortfolioPositionCard'
import FullPositionCard from '@/app/portfolio/components/full-position-card'
import {
  ClobPositionWithType,
  HistoryPosition,
  HistoryPositionWithType,
  usePosition,
} from '@/services'
import { usePrices } from '@/services/MarketsService'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { PortfolioTab } from '@/types/portfolio'

interface PortfolioTabContainerProps {
  positionsFiltered?: (HistoryPositionWithType | ClobPositionWithType)[]
  type: PortfolioTab
  noPositionsText: string
}

export default function PortfolioTabContainer({
  positionsFiltered,
  type,
  noPositionsText,
}: PortfolioTabContainerProps) {
  const { isLoading: tradesAndPositionsLoading } = usePosition()

  const positionsForPrices = useMemo(() => {
    if (!positionsFiltered) return []
    const ammPositions = positionsFiltered.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    return ammPositions
      .map((position) => ({
        address: position.market.id,
        decimals: position.market.collateral?.symbol === 'USDT' ? 6 : 8,
      }))
      .filter(
        (item): item is { address: `0x${string}`; decimals: number } =>
          item.address !== undefined && item.decimals !== undefined
      )
  }, [positionsFiltered])

  const { data: prices } = usePrices(positionsForPrices)

  const getPrices = (id: string) => prices?.find((price) => price.address === id)

  if (!positionsFiltered || tradesAndPositionsLoading) {
    return (
      <Stack gap={{ sm: 2, md: 2 }} w='full'>
        {[...Array(4)].map(() => (
          <Skeleton height={isMobile ? 206 : 112} key={uuidv4()} />
        ))}
      </Stack>
    )
  }

  if (!positionsFiltered.length) {
    return <Text {...paragraphRegular}>{noPositionsText}</Text>
  }

  return (
    <VStack w='full' gap='8px'>
      {positionsFiltered?.map((position) =>
        position.type === 'amm' ? (
          <PortfolioPositionCard
            key={position.market.slug}
            position={position as HistoryPosition}
            prices={(() => getPrices((position as HistoryPosition).market.id))()}
          />
        ) : (
          <FullPositionCard
            key={position.market.slug}
            position={position as ClobPositionWithType}
            type={type}
          />
        )
      )}
    </VStack>
  )
}
