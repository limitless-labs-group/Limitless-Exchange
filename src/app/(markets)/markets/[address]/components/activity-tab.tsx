import { useMarketInfinityFeed } from '@/hooks/use-market-feed'
import TradeActivityTabItem from '@/app/(markets)/markets/[address]/components/trade-activity-tab-item'
import { HStack, Text, VStack } from '@chakra-ui/react'
import Paper from '@/components/common/paper'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { useTradingService } from '@/services'
import Loader from '@/components/common/loader'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useCallback } from 'react'
import debounce from 'lodash.debounce'

export default function MarketActivityTab() {
  const { market } = useTradingService()
  const { data: activityData, fetchNextPage, hasNextPage } = useMarketInfinityFeed(market?.address)

  const getNextPage = useCallback(
    debounce(async () => fetchNextPage(), 1000),
    []
  )

  // @ts-ignore
  const activity = activityData?.pages.flatMap((page) => page.data)

  return !!activity?.length ? (
    <InfiniteScroll
      dataLength={activity?.length ?? 0}
      next={getNextPage}
      hasMore={hasNextPage}
      loader={
        <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
          <Loader />
          <Text {...paragraphRegular}>Loading more posts</Text>
        </HStack>
      }
    >
      {activity.map((activityItem) => (
        <TradeActivityTabItem tradeItem={activityItem} key={activityItem.bodyHash} />
      ))}
    </InfiniteScroll>
  ) : (
    <VStack w='full' mt='24px'>
      <Paper p='16px'>
        <ActivityIcon width={24} height={24} />
      </Paper>
      <Text {...headline} mt='4px'>
        No recent activity
      </Text>
      <Text {...paragraphRegular}>Get started by selecting an outcome</Text>
    </VStack>
  )
}
