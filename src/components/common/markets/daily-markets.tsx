import { Box, Button, Divider, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import DailyMarketCard from '@/components/common/markets/market-cards/daily-market-card'
import DailyMarketCardMobile from '@/components/common/markets/market-cards/daily-market-card-mobile'
import Skeleton from '@/components/common/skeleton'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

interface DailyMarketsSectionProps {
  markets?: Market[]
  totalAmount?: number
  isLoading: boolean
  onClickNextPage: () => void
  onClickPrevPage: () => void
  page: number
}

export default function DailyMarketsSection({
  markets,
  totalAmount = 1,
  isLoading,
  onClickNextPage,
  onClickPrevPage,
  page,
}: DailyMarketsSectionProps) {
  const marketsArray = markets
    // @ts-ignore
    ?.filter((market) => !market.slug)
    .map((market, index) => (
      <DailyMarketCard
        key={market.address}
        market={market}
        analyticParams={{ bannerPosition: index + 1, bannerPaginationPage: page }}
      />
    ))

  const templateRows = useMemo(() => {
    if (!marketsArray) {
      return 'repeat(2, 1fr)'
    }
    return marketsArray.length > 2 ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)'
  }, [marketsArray])

  return (
    <Box mt={isMobile ? '48px' : '24px'} mb={isMobile ? '36px' : 0}>
      <Box px={isMobile ? '16px' : 0}>
        <Text {...headlineRegular} mb={isMobile ? '8px' : '4px'}>
          / Daily markets {isLoading ? '' : `(${totalAmount})`}
        </Text>
        <Divider orientation='horizontal' />
      </Box>

      {isMobile ? (
        <VStack gap={2} w='full' px='16px' mt='16px'>
          {isLoading
            ? [...Array(3)].map((index) => <Skeleton height={200} key={index} />)
            : markets?.map((market, index) => {
                return (
                  <DailyMarketCardMobile
                    key={index}
                    dailyIndex={index + 1}
                    market={market}
                    analyticParams={{ bannerPosition: index + 1, bannerPaginationPage: page }}
                    markets={markets}
                  />
                )
              })}
        </VStack>
      ) : (
        <>
          <Grid
            mt={isMobile ? '16px' : '8px'}
            templateColumns='repeat(2, 1fr)'
            templateRows={templateRows}
            gap='8px'
          >
            {isLoading
              ? [...Array(6)].map((index) => <Skeleton height={160} key={index} />)
              : marketsArray}
          </Grid>
          {totalAmount > 6 && !isLoading && (
            <HStack w='full' mt='12px' justifyContent='flex-end' gap='4px'>
              <Button variant='transparent' onClick={onClickPrevPage}>
                Previous
              </Button>
              <Button variant='transparent' onClick={onClickNextPage}>
                Next
              </Button>
            </HStack>
          )}
        </>
      )}
    </Box>
  )
}
