import { Flex, GridProps, Stack, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PortfolioPositionCard } from '@/app/portfolio/components'
import { useHistory } from '@/services'
import { useUsersMarkets } from '@/services/UsersMarketsService'
import { Token } from '@/types'

export const PortfolioPositions = ({ ...props }: GridProps) => {
  const { positions, getPositions } = useHistory()
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

  return (
    <>
      {/*<Filter onChange={handleSelectFilterTokens} />*/}
      {positionsFiltered?.length == 0 ? (
        <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
          <Text color={'fontLight'}>No open positions</Text>
        </Flex>
      ) : (
        <Stack gap={{ sm: 2, md: 2 }} {...props}>
          {positionsFiltered?.map((position) => (
            <PortfolioPositionCard key={uuidv4()} position={position} />
          ))}
        </Stack>
      )}
    </>
  )
}
