import { PortfolioMarketCard } from '@/app/portfolio/components'
import { useHistory } from '@/services'
import { Flex, Grid, GridProps, Text } from '@chakra-ui/react'
import { useEffect } from 'react'

export const PortfolioMarketsTable = ({ ...props }: GridProps) => {
  const { activeMarkets, getActiveMarkets } = useHistory()

  useEffect(() => {
    getActiveMarkets()
  }, [])

  return activeMarkets?.length == 0 ? (
    <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
      <Text color={'fontLight'}>No trading history yet</Text>
    </Flex>
  ) : (
    <Grid
      templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
      gap={{ sm: 6, md: 10 }}
      {...props}
    >
      {activeMarkets?.map((marketStats, id) => (
        <PortfolioMarketCard key={id} marketStats={marketStats} />
      ))}
    </Grid>
  )
}
