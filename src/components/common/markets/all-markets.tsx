import { Box, Divider, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import DailyMarketCard from '@/components/common/markets/market-cards/daily-market-card'
import DailyMarketCardMobile from '@/components/common/markets/market-cards/daily-market-card-mobile'
import Skeleton from '@/components/common/skeleton'
import SortFilter from '@/components/common/sort-filter'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup, Sort } from '@/types'

interface AllMarketsProps {
  handleSelectSort: (option: Sort) => void
  markets?: (Market | MarketGroup)[]
  totalAmount?: number
  isLoading: boolean
}

export default function AllMarkets({
  handleSelectSort,
  markets,
  totalAmount = 1,
  isLoading,
}: AllMarketsProps) {
  return (
    <>
      <Box px={isMobile ? '16px' : 0} mt='40px'>
        <Divider orientation='horizontal' borderColor='grey.800' />
        <Text {...headlineRegular} mb={isMobile ? '8px' : '4px'} mt={isMobile ? '8px' : '4px'}>
          / All markets {isLoading ? '' : `(${totalAmount})`}
        </Text>
      </Box>
      <SortFilter onChange={handleSelectSort} />
      {/*<InfiniteScroll*/}
      {/*  dataLength={dataLength}*/}
      {/*  next={fetchNextPage}*/}
      {/*  hasMore={hasNextPage}*/}
      {/*  loader={<h4></h4>}*/}
      {/*  scrollThreshold={0.1}*/}
      {/*  refreshFunction={fetchNextPage}*/}
      {/*  pullDownToRefresh*/}
      {/*  style={{*/}
      {/*    overflow: 'unset',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  */}
      {/*</InfiniteScroll>*/}
      <VStack w={'full'} spacing={5} px={isMobile ? '16px' : 0}>
        <VStack gap={2} w='full'>
          {isLoading
            ? [...Array(6)].map((index) => <Skeleton height={isMobile ? 148 : 76} key={index} />)
            : markets?.map((market, index) => {
                // @ts-ignore
                return market.slug ? null : (
                  <>
                    {isMobile ? (
                      <DailyMarketCardMobile
                        key={index}
                        market={market as Market}
                        analyticParams={{ bannerPosition: index + 1, bannerPaginationPage: 1 }}
                        markets={markets as Market[]}
                      />
                    ) : (
                      <DailyMarketCard
                        key={index}
                        market={market as Market}
                        analyticParams={{ bannerPosition: index + 1, bannerPaginationPage: 1 }}
                      />
                    )}
                  </>
                )
              })}
        </VStack>
      </VStack>
    </>
  )
}
