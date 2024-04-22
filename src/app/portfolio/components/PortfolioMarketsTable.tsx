import { PortfolioMarketCard, PortfolioMobileMarketCard } from '@/app/portfolio/components'
import { useHistory } from '@/services'
import { Flex, Grid, GridProps, Text, useMediaQuery } from '@chakra-ui/react'
import { useEffect } from 'react'
import { IPHONE14_PRO_MAX_WIDTH } from '@/constants/device'

export const PortfolioMarketsTable = ({ ...props }: GridProps) => {
  const { activeMarkets, getActiveMarkets } = useHistory()
  const [isLargerThan430] = useMediaQuery(`(min-width: ${IPHONE14_PRO_MAX_WIDTH + 1}px)`)

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
      {activeMarkets?.map((marketStats, id) =>
        isLargerThan430 ? (
          <PortfolioMarketCard key={id} marketStats={marketStats} />
        ) : (
          <PortfolioMobileMarketCard key={id} marketStats={marketStats} />
        )
      )}
    </Grid>
  )
}
