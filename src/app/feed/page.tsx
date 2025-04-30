'use client'

import { Box, Divider, HStack, VStack, Text, Heading } from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import { useCallback, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import { v4 as uuidv4 } from 'uuid'
import Loader from '@/components/common/loader'
import FeedItem from '@/components/feed/components/feed-item'
import { MainLayout } from '@/components'
import { useFeed } from '@/hooks/use-feed'
import { h1Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { FeedEntity } from '@/types'

export default function MainPage() {
  // const queryClient = useQueryClient()
  // const [isFixed, setIsFixed] = useState(false)
  // const buttonRef = useRef(null)

  const { data: feedEvents, fetchNextPage, hasNextPage } = useFeed()

  // const scrollOffset = isMobile ? 156 : 122

  // Todo keep this functionality until scroll is implemented
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (buttonRef.current) {
  //       const value = window.scrollY + 28 <= scrollOffset ? scrollOffset : 28
  //
  //       if (window.scrollY >= value) {
  //         setIsFixed(true)
  //         return
  //       } else {
  //         setIsFixed(false)
  //         return
  //       }
  //     }
  //   }
  //
  //   window.addEventListener('scroll', handleScroll)
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll)
  //   }
  // }, [])

  // const refetchFirstPage = async () => {
  //   queryClient.setQueryData(['feed'], (oldData: any) => ({
  //     ...oldData,
  //     pages: oldData?.pages.slice(0, 1),
  //   }))
  //   // @ts-ignore
  //   await refetch({ refetchPage: (_page, index) => index === 0 })
  // }

  // const handleLatestClicked = async () => {
  //   window.scrollTo(0, 0)
  //   await refetchFirstPage()
  // }

  const getNextPage = useCallback(
    debounce(async () => fetchNextPage(), 1000),
    []
  )

  const pagesData: FeedEntity<unknown>[] = useMemo(() => {
    // @ts-ignore
    return feedEvents?.pages?.map((el) => el.data.data).flat()
  }, [feedEvents])

  return (
    <MainLayout isLoading={false}>
      <Box w={isMobile ? 'full' : '664px'} className='full-container'>
        <Divider orientation='horizontal' h='3px' mb='16px' borderColor='grey.800' bg='grey.800' />
        <Heading as='h1' {...h1Bold} gap={2} userSelect='text'>
          Limitless Feed
        </Heading>
        {/*<HStack justifyContent='center' w='full'>*/}
        {/*  <Box*/}
        {/*    ref={buttonRef}*/}
        {/*    position={isFixed ? 'fixed' : 'absolute'}*/}
        {/*    top={isFixed ? '28px' : scrollOffset}*/}
        {/*    zIndex='50'*/}
        {/*  >*/}
        {/*    <Button variant='contained' onClick={handleLatestClicked}>*/}
        {/*      View Latest Posts*/}
        {/*    </Button>*/}
        {/*  </Box>*/}
        {/*</HStack>*/}
        <InfiniteScroll
          dataLength={pagesData?.length ?? 0}
          next={getNextPage}
          hasMore={hasNextPage}
          loader={
            <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
              <Loader />
              <Text {...paragraphRegular}>Loading more posts</Text>
            </HStack>
          }
        >
          <VStack gap={isMobile ? 0 : '8px'} alignItems='baseline' mt={isMobile ? '44px' : '56px'}>
            {pagesData?.map((item) => (
              <FeedItem data={item} key={uuidv4()} />
            ))}
          </VStack>
        </InfiniteScroll>
      </Box>
    </MainLayout>
  )
}
