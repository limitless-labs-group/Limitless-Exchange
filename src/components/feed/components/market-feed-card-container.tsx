import { Box, HStack, Link, Text } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { PropsWithChildren, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import { defaultChain } from '@/constants'
import { captionRegular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { FeedEventUser } from '@/types'
import { timeSinceCreation, truncateEthAddress } from '@/utils'

interface MarketFeedCardContainer {
  user: FeedEventUser
  timestamp: number
  title: string
  isActivityTab?: boolean
}

export default function MarketFeedCardContainer({
  user,
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
              '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'grey.300' },
            }
          : {}),
      }}
      borderColor='grey.300'
      w='full'
    >
      <HStack gap='8px' flexWrap='wrap' mb={isMobile ? '16px' : '12px'}>
        <Avatar account={user.account || ''} avatarUrl={user.imageURI} />
        {user.link ? (
          <Link href={user.link} variant='textLinkSecondary' {...captionRegular}>
            {user.name}
          </Link>
        ) : (
          <Link
            href={`${defaultChain.blockExplorers.default.url}/address/${user.account}`}
            target={'_blank'}
            variant='textLinkSecondary'
            {...captionRegular}
            color='grey.500'
            textOverflow='ellipsis'
            whiteSpace='nowrap'
            overflow='hidden'
            maxW='calc(100% - 22px)'
          >
            {
              ethers.utils.isAddress(user.name)
                ? truncateEthAddress(user.account)
                : user.name ?? truncateEthAddress(user.account) //?? needs to cover edge case of old account which don't have profile on the platform
            }
          </Link>
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
