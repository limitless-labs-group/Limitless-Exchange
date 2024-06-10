import { PortfolioPositionCard } from '@/app/portfolio/components';
import { useHistory } from '@/services';
import { Flex, Grid, GridProps, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Filter from '@/components/common/TokenFilter';
import { Token } from '@/types';
import { useUsersMarkets } from '@/services/UsersMarketsService';
import { getAddress } from 'viem';

export const PortfolioPositions = ({ ...props }: GridProps) => {
  const { positions, getPositions } = useHistory();
  const { data: userMarkets } = useUsersMarkets();

  useEffect(() => {
    getPositions();
  }, []);

  /**
   * FILTERING
   */
  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([]);
  const handleSelectFilterTokens = (tokens: Token[]) => setSelectedFilterTokens(tokens);

  const positionsFiltered = useMemo(
    () =>
      positions
        ?.filter((position) =>
          selectedFilterTokens.length > 0
            ? selectedFilterTokens.some((filterToken) => filterToken.symbol == position.market.collateral?.symbol)
            : true,
        )
        .filter((position) => {
          const market = userMarkets?.find(
            (userMarket) => getAddress(userMarket.market.id) === getAddress(position.market.id),
          );
          return !market?.market.closed;
        }),
    [positions, selectedFilterTokens],
  );

  return (
    <>
      <Filter onChange={handleSelectFilterTokens} />
      {positionsFiltered?.length == 0 ? (
        <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
          <Text color={'fontLight'}>No open positions</Text>
        </Flex>
      ) : (
        <Grid templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={{ sm: 6, md: 10 }} {...props}>
          {positionsFiltered?.map((position) => (
            <PortfolioPositionCard key={uuidv4()} position={position} />
          ))}
        </Grid>
      )}
    </>
  );
};
