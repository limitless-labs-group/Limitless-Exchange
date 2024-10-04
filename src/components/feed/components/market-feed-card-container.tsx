import { FeedEventUser } from '@/types'
import { PropsWithChildren, useMemo } from 'react'
import { Box, HStack, Link, Text } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { timeSinceCreation, truncateEthAddress } from '@/utils'
import { captionRegular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import Avatar from '@/components/common/avatar'

interface MarketFeedCardContainer {
  creator: FeedEventUser
  timestamp: number
  title: string
  isActivityTab?: boolean
}

export default function MarketFeedCardContainer({
  creator,
  timestamp,
  title,
  children,
  isActivityTab = false,
}: PropsWithChildren<MarketFeedCardContainer>) {
  const timePassed = timeSinceCreation(timestamp)
  const bottomPadding = useMemo(() => {
    if (isActivityTab) {
      return 0
    }
    return isMobile ? '24px' : '12px'
  }, [isActivityTab])
  return (
    <Box
      pt={isMobile ? '12px' : '8px'}
      pb={bottomPadding}
      borderTop={isActivityTab ? 'unset' : '1px solid'}
      sx={{
        ...(isActivityTab
          ? {
              '&:not(:last-child)': { borderBottom: '1px solid' },
            }
          : {}),
      }}
      borderColor='grey.300'
      w='full'
    >
      <HStack gap='8px' flexWrap='wrap' mb={isMobile ? '16px' : '12px'}>
        <Avatar account={creator.account || ''} avatarUrl={creator.imageURI} />
        {creator.link ? (
          <Link href={creator.link}>
            <Text {...captionRegular}>{creator.name}</Text>
          </Link>
        ) : (
          <Text {...captionRegular}>
            {isMobile ? truncateEthAddress(creator.account) : creator.account}
          </Text>
        )}
        <Text {...captionRegular} color='grey.500'>
          {timePassed}
        </Text>
      </HStack>
      <Text
        {...paragraphRegular}
        fontSize='16px'
        marginTop={isMobile ? '16px' : '12px'}
        marginBottom={isMobile ? '12px' : '8px'}
        userSelect='text'
      >
        {title}
      </Text>
      {children}
    </Box>
  )
}
