import { Creator } from '@/types'
import { PropsWithChildren } from 'react'
import { Box, HStack, Link, Text } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { Image as ChakraImage } from '@chakra-ui/image/dist/image'
import { timeSinceCreation } from '@/utils'
import { captionRegular } from '@/styles/fonts/fonts.styles'

interface MarketFeedCardContainer {
  creator: Creator
  timestamp: number
}

export default function MarketFeedCardContainer({
  creator,
  timestamp,
  children,
}: PropsWithChildren<MarketFeedCardContainer>) {
  const timePassed = timeSinceCreation(timestamp)
  return (
    <Box
      pt={isMobile ? '12px' : '8px'}
      pb={isMobile ? '24px' : '12px'}
      borderTop='1px solid'
      borderColor='grey.300'
    >
      <HStack gap='8px' flexWrap='wrap' mb={isMobile ? '16px' : '12px'}>
        <ChakraImage
          width={6}
          height={6}
          src={creator.imageURI ?? '/assets/images/logo.svg'}
          alt='creator'
          borderRadius={'2px'}
        />
        <Link href={creator.link}>
          <Text {...captionRegular}>{creator.name}</Text>
        </Link>
        <Text {...captionRegular} color='grey.500'>
          {timePassed}
        </Text>
      </HStack>
      {children}
    </Box>
  )
}
