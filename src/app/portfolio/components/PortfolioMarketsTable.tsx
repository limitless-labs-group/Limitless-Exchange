import { PortfolioMarketCard } from '@/app/portfolio/components'
import { defaultChain, markets } from '@/constants'
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
    <Grid templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6} {...props}>
      {activeMarkets?.map((marketStats, id) => {
        // TODO: replace hardcoded markets with dynamic
        const market = markets.find(
          (market) => market.address[defaultChain.id].toLowerCase() == marketStats.market.id
        )
        if (!market || market.closed) {
          return <></>
        }
        return <PortfolioMarketCard key={id} marketStats={marketStats} />
      })}
    </Grid>
  )
}
