import { Flex, Stack, Text } from '@chakra-ui/react'
import { memo, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Skeleton from '@/components/common/skeleton'
import PortfolioPositionCard from '@/app/portfolio/components/PortfolioPositionCard'
import { useHistory } from '@/services'
import { useUsersMarkets } from '@/services/UsersMarketsService'
import { Token } from '@/types'

const PortfolioPositionsContainer = ({ userMenuLoading }: { userMenuLoading: boolean }) => {
  const { positions, getPositions, tradesAndPositionsLoading } = useHistory()
  const { data: userMarkets } = useUsersMarkets()

  useEffect(() => {
    getPositions()
  }, [])

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

  if (userMenuLoading || !positionsFiltered || tradesAndPositionsLoading) {
    return (
      <Stack gap={{ sm: 2, md: 2 }}>
        {[...Array(4)].map((index) => (
          <Skeleton height={isMobile ? 206 : 112} key={index} />
        ))}
      </Stack>
    )
  }

  return (
    <>
      {/*<Filter onChange={handleSelectFilterTokens} />*/}
      {positionsFiltered.length == 0 ? (
        <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
          <Text color={'fontLight'}>No open positions</Text>
        </Flex>
      ) : (
        <Stack gap={{ sm: 2, md: 2 }}>
          {positionsFiltered?.map((position) => (
            <PortfolioPositionCard key={position.market.id} position={position} />
          ))}
        </Stack>
      )}
    </>
  )
}

export const PortfolioPositions = memo(PortfolioPositionsContainer)
