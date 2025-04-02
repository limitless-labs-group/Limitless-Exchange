import { Text, Divider, HStack, VStack, Flex } from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import { Fragment, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import Paper from '@/components/common/paper'
import Comment from './comment'
import CommentIcon from '@/resources/icons/opinion-icon.svg'
import { useMarketInfinityComments, useTradingService } from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'

export default function Comments() {
  const { market, groupMarket } = useTradingService()
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
  } = useMarketInfinityComments(
    market?.marketType === 'group' ? (groupMarket?.slug as string) : (market?.slug as string),
    market?.marketType
  )

  const getNextPage = useCallback(
    debounce(async () => fetchNextPage(), 1000),
    []
  )
  // @ts-ignore
  const comments = commentsData?.pages.flatMap((page) => page.data.comments)

  return !!comments?.length ? (
    <Flex w='full' mt='24px'>
      <InfiniteScroll
        className='scroll'
        dataLength={comments?.length ?? 0}
        next={getNextPage}
        hasMore={hasNextPage}
        style={{ width: '100%' }}
        loader={
          <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
            <Loader />
            <Text {...paragraphRegular}>Loading more comments</Text>
          </HStack>
        }
      >
        <VStack w='full' gap='16px'>
          {comments.map((comment) => (
            <Fragment key={comment.id}>
              <Comment key={comment.id} comment={comment} />
              <Divider />
            </Fragment>
          ))}
        </VStack>
      </InfiniteScroll>
    </Flex>
  ) : (
    <VStack w='full' mt={isMobile ? '50px' : '24px'} mb={isMobile ? '120px' : '24px'}>
      <Paper p='16px'>
        <CommentIcon width={24} height={24} />
      </Paper>
      <Text {...headline} mt='4px'>
        No comment yet
      </Text>
      <Text {...paragraphRegular}>Be the first to share your opinion!</Text>
    </VStack>
  )
}
