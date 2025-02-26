import { HStack, Text, VStack } from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import { useCallback } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import ActivityClobItem from '@/components/common/markets/activity/activity-clob-item'
import Paper from '@/components/common/paper'
import { useMarketClobInfinityFeed } from '@/hooks/use-market-feed'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import { useTradingService } from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { ClobTradeEvent } from '@/types/orders'

export default function ActivityClob() {
  const { market } = useTradingService()
  const { data: activityData, fetchNextPage, hasNextPage } = useMarketClobInfinityFeed(market?.slug)

  // @ts-ignore
  const activity = activityData?.pages.flatMap((page) => page.data.events)

  const getNextPage = useCallback(
    debounce(async () => fetchNextPage(), 1000),
    []
  )

  return !!activity?.length ? (
    <InfiniteScroll
      dataLength={activity?.length ?? 0}
      next={getNextPage}
      hasMore={hasNextPage}
      loader={
        <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
          <Loader />
          <Text {...paragraphRegular}>Loading more events</Text>
        </HStack>
      }
    >
      {activity.map((activityItem: ClobTradeEvent) => (
        <ActivityClobItem key={activityItem.createdAt} data={activityItem} />
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
