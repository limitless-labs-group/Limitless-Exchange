import { feedMockData } from '@/app/feed/utils'
import { VStack } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import FeedItem from '@/app/feed/components/feed-item'
import { v4 as uuidv4 } from 'uuid'

const data = feedMockData

export default function FeedPage() {
  return (
    <VStack gap={isMobile ? 0 : '8px'}>
      {data.map((item) => (
        <FeedItem data={item as any} key={uuidv4()} />
      ))}
    </VStack>
  )
}
