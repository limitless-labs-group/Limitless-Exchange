import { PortfolioMarketCard, PortfolioMobileMarketCard } from '@/app/portfolio/components'
import { useHistory } from '@/services'
import { Flex, Grid, GridProps, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useIsMobile } from '@/hooks'

export const PortfolioMarketsTable = ({ ...props }: GridProps) => {
  const { activeMarkets, getActiveMarkets } = useHistory()
  const isMobile = useIsMobile()

  useEffect(() => {
    getActiveMarkets()
  }, [])

  return activeMarkets?.length == 0 ? (
    <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
      <Text color={'fontLight'}>No open markets</Text>
    </Flex>
  ) : (
    <Grid
      templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
      gap={{ sm: 6, md: 10 }}
      {...props}
    >
      {activeMarkets?.map((marketStats, id) =>
        isMobile ? (
          <PortfolioMobileMarketCard key={uuidv4()} marketStats={marketStats} />
        ) : (
          <PortfolioMarketCard key={uuidv4()} marketStats={marketStats} />
        )
      )}
    </Grid>
  )
}
