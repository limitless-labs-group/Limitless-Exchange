import { Stack, VStack } from '@chakra-ui/react'
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
import { MarketStatus } from '@/types'

export default function EverythingTab() {
  const { data: positions, isLoading: tradesAndPositionsLoading } = usePosition()

  const getPrices = (id: string) => prices?.find((price) => price.address === id)
  const positionsFiltered = useMemo(() => {
    return positions?.positions
      .sort((a, b) => {
        const deadlineA = a.type === 'amm' ? a.market.expirationDate : a.market.deadline
        const deadlineB = b.type === 'amm' ? b.market.expirationDate : b.market.deadline
        return new Date(deadlineA).getTime() - new Date(deadlineB).getTime()
      })
      .sort((a, b) => {
        const isClosedA =
          //@ts-ignore
          a.type === 'amm' ? a.market.closed : a.market.status === MarketStatus.RESOLVED
        const isClosedB =
          //@ts-ignore
          b.type === 'amm' ? b.market.closed : b.market.status === MarketStatus.RESOLVED
        return isClosedA === isClosedB ? 0 : isClosedA ? -1 : 1
      })
  }, [positions])
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

  if (!positionsFiltered || tradesAndPositionsLoading) {
    return (
      <Stack gap={{ sm: 2, md: 2 }} w='full'>
        {[...Array(4)].map(() => (
          <Skeleton height={isMobile ? 206 : 112} key={uuidv4()} />
        ))}
      </Stack>
    )
  }

  return (
    <VStack w='full' gap='8px'>
      {positions?.positions.map((position) =>
        position.type === 'amm' ? (
          <PortfolioPositionCard
            key={uuidv4()}
            position={position as HistoryPosition}
            prices={(() => getPrices((position as HistoryPosition).market.id))()}
          />
        ) : (
          <FullPositionCard key={uuidv4()} position={position as ClobPositionWithType} />
        )
      )}
    </VStack>
  )
}
