import { HStack, Text, VStack, Box } from '@chakra-ui/react'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import PieChartIcon from '@/resources/icons/pie-chart-icon.svg'
import { captionRegular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { FeedEntity, FeedNewComment } from '@/types'

interface FeedNewPostProps {
  data: FeedEntity<FeedNewComment>
}

export function FeedComment({ data }: FeedNewPostProps) {
  return (
    <MarketFeedCardContainer
      user={data.user}
      eventType={data.eventType}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={`${data.data.content}`}
    >
      <VStack alignItems='start'>
        <Text {...paragraphRegular}>{data.data.content}</Text>
        <HStack gap='4px' color='grey.500' w='full'>
          <PieChartIcon width={14} height={14} />
          <Box maxW='calc(100% - 30px)' borderBottom='1px solid' borderColor='greyTransparent.200'>
            <Text
              {...captionRegular}
              w='full'
              color='grey.500'
              textOverflow='ellipsis'
              whiteSpace='nowrap'
              overflow='hidden'
            >
              {data.data.title}
            </Text>
          </Box>
        </HStack>
      </VStack>
    </MarketFeedCardContainer>
  )
}
