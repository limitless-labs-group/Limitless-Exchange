import { Box, HStack, Text, VStack } from '@chakra-ui/react'
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
  const { market, groupMarket } = useTradingService()
  const {
    data: activityData,
    fetchNextPage,
    hasNextPage,
  } = useMarketClobInfinityFeed(groupMarket?.negRiskMarketId ? groupMarket?.slug : market?.slug)

  // @ts-ignore
  const activity = activityData?.pages.flatMap((page) => page.data.events)

  const getNextPage = useCallback(
    debounce(async () => fetchNextPage(), 1000),
    []
  )

  return !!activity?.length ? (
    <Box
      id='scrollableDiv'
      h={activity?.length < 10 ? 'unset' : '325px'}
      overflow='auto'
      sx={{
        '& > div': {
          width: '100% !important',
        },
      }}
    >
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
        scrollableTarget='scrollableDiv'
        scrollThreshold='20px'
      >
        {activity.map((activityItem: ClobTradeEvent) => (
          <ActivityClobItem key={activityItem.createdAt} data={activityItem} />
        ))}
      </InfiniteScroll>
    </Box>
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
