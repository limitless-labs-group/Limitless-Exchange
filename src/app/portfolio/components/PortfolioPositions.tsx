import { Flex, Stack, Text } from '@chakra-ui/react'
import { memo, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import Skeleton from '@/components/common/skeleton'
import PortfolioPositionCard from '@/app/portfolio/components/PortfolioPositionCard'
import { useHistory } from '@/services'
import { usePrices } from '@/services/MarketsService'
import { useUsersMarkets } from '@/services/UsersMarketsService'
import { Token } from '@/types'

const PortfolioPositionsContainer = ({ userMenuLoading }: { userMenuLoading: boolean }) => {
  const { positions, tradesAndPositionsLoading } = useHistory()
  const { data: userMarkets } = useUsersMarkets()

  /**
   * FILTERING
   */
  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])
  const handleSelectFilterTokens = (tokens: Token[]) => setSelectedFilterTokens(tokens)

  const positionsFiltered = useMemo(
    () =>
      positions
        ?.sort((a, b) => (a.market.closed === b.market.closed ? 0 : a.market.closed ? -1 : 1))
        ?.filter((position) =>
          selectedFilterTokens.length > 0
            ? selectedFilterTokens.some(
                (filterToken) => filterToken.symbol == position.market.collateral?.symbol
              )
            : true
        ),
    [positions, selectedFilterTokens, userMarkets]
  )

  const positionsForPrices = useMemo(() => {
    if (!positionsFiltered) return []
    return positionsFiltered
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

  if (userMenuLoading || !positionsFiltered || tradesAndPositionsLoading) {
    return (
      <Stack gap={{ sm: 2, md: 2 }}>
        {[...Array(4)].map((index) => (
          <Skeleton height={isMobile ? 206 : 112} key={index} />
        ))}
      </Stack>
    )
  }
  const getPrices = (id: string) => prices?.find((price) => price.market === id)

  return (
    <>
      {positionsFiltered.length == 0 ? (
        <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
          <Text color={'fontLight'}>No open positions</Text>
        </Flex>
      ) : (
        <Stack gap={{ sm: 2, md: 2 }}>
          {positionsFiltered?.map((position) => {
            return (
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
