import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import { useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import Paper from '@/components/common/paper'
import TradeActivityTabItem from '@/app/(markets)/markets/[address]/components/trade-activity-tab-item'
import { useMarketInfinityFeed } from '@/hooks/use-market-feed'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import { useTradingService } from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface MarketActivityTabProps {
  isActive: boolean
}

export default function ActivityAmm({ isActive }: MarketActivityTabProps) {
  const { market } = useTradingService()
  const {
    data: activityData,
    fetchNextPage,
    hasNextPage,
  } = useMarketInfinityFeed(market?.address, isActive)

  const getNextPage = useCallback(
    debounce(async () => fetchNextPage(), 1000),
    []
  )

  // @ts-ignore
  const activity = activityData?.pages.flatMap((page) => page.data)

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
            <Text {...paragraphRegular}>Loading more posts</Text>
          </HStack>
        }
        scrollableTarget='scrollableDiv'
        scrollThreshold='20px'
      >
        <Box mb='30px'>
          {activity.map((activityItem) => (
            <TradeActivityTabItem tradeItem={activityItem} key={activityItem.bodyHash} />
          ))}
        </Box>
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
