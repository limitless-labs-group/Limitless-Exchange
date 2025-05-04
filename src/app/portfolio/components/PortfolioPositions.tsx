import { PortfolioPositionCard } from '@/app/portfolio/components'
import { useHistory } from '@/services'
import { Flex, Grid, GridProps, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Filter from '@/components/common/TokenFilter'
import { Token } from '@/types'
import { useUsersMarkets } from '@/services/UsersMarketsService'
import { Address, getAddress } from 'viem'

const positions = [
  {
    market: {
      id: '0x1' as Address,
      closed: true,
      funding: '1000000000',
      condition_id: '0xdc9262d6415bac503f993260954b3cf52b277e142306f55152a8723108ff10d6' as Address,
      collateral: {
        symbol: 'USDC',
      },
    },
    outcomeTokenAmounts: [272759, 0],
    outcomeTokenNetCost: '100000',
    blockTimestamp: '1721743917',
    transactionHash: '0x9ccda5c737ad5fe9bde270552694aa6d3e8d703e176f0b909bc109d3d457b9d1',
    outcomeIndex: 1,
  },
]

export const PortfolioPositions = ({ ...props }: GridProps) => {
  // const { positions, getPositions } = useHistory()
  // const { data: userMarkets } = useUsersMarkets()

  console.log(positions)

  // useEffect(() => {
  //   getPositions()
  // }, [])

  /**
   * FILTERING
   */
  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])
  const handleSelectFilterTokens = (tokens: Token[]) => setSelectedFilterTokens(tokens)

  const positionsFiltered = useMemo(
    () =>
      positions?.filter((position) =>
        selectedFilterTokens.length > 0
          ? selectedFilterTokens.some(
              (filterToken) => filterToken.symbol == position.market.collateral?.symbol
            )
          : true
      ),
    [positions, selectedFilterTokens]
  )

  console.log(positionsFiltered)

  return (
    <>
      <Filter onChange={handleSelectFilterTokens} />
      {positionsFiltered?.length == 0 ? (
        <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
          <Text color={'fontLight'}>No open positions</Text>
        </Flex>
      ) : (
        <Grid
          templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
          gap={{ sm: 6, md: 10 }}
          {...props}
        >
          {positionsFiltered?.map((position) => (
            <PortfolioPositionCard key={uuidv4()} position={position} />
          ))}
        </Grid>
      )}
    </>
  )
}
