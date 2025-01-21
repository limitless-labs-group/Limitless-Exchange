import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import DailyMarketCard from '@/components/common/markets/market-cards/daily-market-card'
import DailyMarketCardMobile from '@/components/common/markets/market-cards/daily-market-card-mobile'
import Skeleton from '@/components/common/skeleton'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { Market, Sort, SortStorageName } from '@/types'
import SortFilter from '../sort-filter'

interface DailyMarketsSectionProps {
  markets?: Market[]
  handleSelectSort: (option: Sort, name: SortStorageName) => void
  totalAmount?: number
  isLoading: boolean
}

export default function DailyMarketsSection({
  markets,
  handleSelectSort,
  totalAmount = 1,
  isLoading,
}: DailyMarketsSectionProps) {
  return (
    <Box mt={isMobile ? '48px' : '24px'} mb={isMobile ? '36px' : 0}>
      <Box px={isMobile ? '16px' : 0}>
        <Divider orientation='horizontal' borderColor='grey.100' />
        <Flex justifyContent='space-between' flexDirection={isMobile ? 'column' : 'row'}>
          <Text {...headlineRegular} mt={isMobile ? '8px' : '4px'}>
            All Markets {isLoading ? '' : `(${totalAmount})`}
          </Text>
          <SortFilter onChange={handleSelectSort} storageName={SortStorageName.SORT} />
        </Flex>
      </Box>
      <VStack gap={2} w='full' px={isMobile ? '16px' : 0} mt={isMobile ? '16px' : '24px'}>
        {isLoading
          ? [...Array(3)].map((index) => <Skeleton height={200} key={index} />)
          : markets?.map((market, index) => {
              return isMobile ? (
                <DailyMarketCardMobile
                  key={index}
                  market={market}
                  analyticParams={{ bannerPosition: index + 1, bannerPaginationPage: 1 }}
                  markets={markets}
                />
              ) : (
                <DailyMarketCard
                  key={index}
                  market={market}
                  analyticParams={{ bannerPosition: index + 1, bannerPaginationPage: 1 }}
                />
              )
            })}
      </VStack>
    </Box>
  )
}
