import { Flex, Stack, Text } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import Skeleton from '@/components/common/skeleton'
import PortfolioPositionCard from '@/app/portfolio/components/PortfolioPositionCard'
import PortfolioPositionCardClob from '@/app/portfolio/components/PortfolioPositionCardClob'
import { HistoryPositionWithType, useHistory } from '@/services'
import { usePrices } from '@/services/MarketsService'
import { MarketStatus } from '@/types'

const PortfolioPositionsContainer = ({ userMenuLoading }: { userMenuLoading: boolean }) => {
  const { positions, tradesAndPositionsLoading } = useHistory()

  const positionsFiltered = useMemo(() => {
    return positions?.sort((a, b) => {
      const isClosedA =
        a.type === 'amm' ? a.market.closed : a.market.status === MarketStatus.RESOLVED
      const isClosedB =
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

  console.log(positionsForPrices)

  const { data: prices } = usePrices(positionsForPrices)

  if (userMenuLoading || !positionsFiltered || tradesAndPositionsLoading) {
    return (
      <Stack gap={{ sm: 2, md: 2 }}>
        {[...Array(4)].map((index) => (
          <Skeleton height={isMobile ? 206 : 112} key={index} />
        ))}
      </Stack>
    )
  }
  const getPrices = (id: string) => prices?.find((price) => price.address === id)

  return (
    <>
      {/*<Filter onChange={handleSelectFilterTokens} />*/}
      {positionsFiltered.length == 0 ? (
        <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
          <Text color={'fontLight'}>No open positions</Text>
        </Flex>
      ) : (
        <Stack gap={{ sm: 2, md: 2 }}>
          {positionsFiltered?.map((position) => {
            return position.type === 'clob' ? (
              <PortfolioPositionCardClob position={position} key={uuidv4()} />
            ) : (
              <PortfolioPositionCard
                key={uuidv4()}
                position={position}
                prices={(() => getPrices(position.market.id))()}
              />
            )
          })}
        </Stack>
      )}
    </>
  )
}

export const PortfolioPositions = memo(PortfolioPositionsContainer)
