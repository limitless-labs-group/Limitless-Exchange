import { Text, Divider, HStack, VStack, Flex } from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import { Fragment, useCallback } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import Comment from './comment'
import { useMarketInfinityComments, useTradingService } from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'

export default function Comments() {
  const { market } = useTradingService()
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
  } = useMarketInfinityComments(market?.address)

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
              <Divider color='grey.300' />
            </Fragment>
          ))}
        </VStack>
      </InfiniteScroll>
    </Flex>
  ) : (
    <VStack w='full' mt='24px'>
      <Text {...headline} mt='4px'>
        No comments yet
      </Text>
    </VStack>
  )
}