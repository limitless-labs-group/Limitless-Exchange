import SortFilter from '@/components/common/sort-filter'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Divider, Text, VStack } from '@chakra-ui/react'
import { MarketGroupCard, MarketSingleCard } from '@/components/common/markets/market-cards'
import { MarketGroupCardResponse, MarketSingleCardResponse, Sort } from '@/types'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { isMobile } from 'react-device-detect'

interface AllMarketsProps {
  handleSelectSort: (option: Sort) => void
  dataLength: number
  fetchNextPage: () => void
  hasNextPage: boolean
  markets?: (MarketGroupCardResponse | MarketSingleCardResponse)[]
}

export default function AllMarkets({
  handleSelectSort,
  dataLength,
  fetchNextPage,
  hasNextPage,
  markets,
}: AllMarketsProps) {
  return (
    <>
      <Text {...headlineRegular} mb={isMobile ? '8px' : '4px'} mt={isMobile ? '36px' : '40px'}>
        / All markets ({markets?.length})
      </Text>
      <Divider orientation='horizontal' />
      <SortFilter onChange={handleSelectSort} />
      <InfiniteScroll
        dataLength={dataLength}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<h4></h4>}
        scrollThreshold={0.1}
        refreshFunction={fetchNextPage}
        pullDownToRefresh
      >
        <VStack w={'full'} spacing={5}>
          <VStack gap={2} w='full'>
            {markets?.map((market) => {
              // @ts-ignore
              return market.slug ? (
                <MarketGroupCard marketGroup={market as MarketGroupCardResponse} />
              ) : (
                <MarketSingleCard market={market as MarketSingleCardResponse} />
              )
            })}
          </VStack>
        </VStack>
      </InfiniteScroll>
    </>
  )
}
