import { Box, Divider, Grid, Text } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { MarketGroupCardResponse, MarketSingleCardResponse } from '@/types'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import DailyMarketCard from '@/components/common/markets/market-cards/daily-market-card'
import Carousel from '@/components/common/carousel/carousel'

interface DailyMarketsSectionProps {
  markets: (MarketSingleCardResponse | MarketGroupCardResponse)[]
  totalAmount?: number
}

export default function DailyMarketsSection({
  markets,
  totalAmount = 1,
}: DailyMarketsSectionProps) {
  const marketsArray = markets
    // @ts-ignore
    // Todo adjust market groups if needed
    .filter((market) => !market.slug)
    .map((market) => (
      <DailyMarketCard
        key={(market as MarketSingleCardResponse).address}
        market={market as MarketSingleCardResponse}
      />
    ))

  return (
    <Box mt={isMobile ? '40px' : 0}>
      <Box px={isMobile ? '16px' : 0}>
        <Text {...headlineRegular} mb={isMobile ? '8px' : '4px'}>
          / Daily markets ({totalAmount})
        </Text>
        <Divider orientation='horizontal' />
      </Box>

      {isMobile ? (
        <Box mt='16px'>
          <Carousel slides={marketsArray}></Carousel>
        </Box>
      ) : (
        <Grid
          mt={isMobile ? '16px' : '8px'}
          templateColumns='repeat(2, 1fr)'
          templateRows='repeat(2, 1fr)'
          gap='8px'
        >
          {marketsArray}
        </Grid>
      )}
    </Box>
  )
}
