import { Box, Divider, Grid, Text } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { MarketSingleCardResponse } from '@/types'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import DailyMarketCard from '@/components/common/markets/market-cards/daily-market-card'
import Carousel from '@/components/common/carousel/carousel'

interface DailyMarketsSectionProps {
  markets: MarketSingleCardResponse[]
}

export default function DailyMarketsSection({ markets }: DailyMarketsSectionProps) {
  const marketsArray = markets.map((market) => (
    <DailyMarketCard key={market.address} market={market} />
  ))

  return (
    <Box mt={isMobile ? '40px' : 0}>
      <Box px={isMobile ? '16px' : 0}>
        <Text {...headlineRegular} mb={isMobile ? '8px' : '4px'}>
          / Daily markets ({markets.length})
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
