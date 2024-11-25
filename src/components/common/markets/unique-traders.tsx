import { Box } from '@chakra-ui/react'
import { useMemo } from 'react'
import React from 'react'
import { useMarketFeed } from '@/hooks/use-market-feed'
import { useTradingService } from '@/services'
import Avatar from '../avatar'

export const UniqueTraders = React.memo(() => {
  const { market } = useTradingService()

  const { data: marketFeedData } = useMarketFeed(market?.address)

  const uniqueUsersTrades = useMemo(() => {
    if (marketFeedData?.data.length) {
      const uniqueUsers = new Map()

      for (const event of marketFeedData.data) {
        if (!uniqueUsers.has(event.user?.account)) {
          uniqueUsers.set(event.user?.account, event)
        }
        if (uniqueUsers.size >= 3) break
      }

      return Array.from(uniqueUsers.values())
    }
    return null
  }, [marketFeedData])

  return (
    <>
      {uniqueUsersTrades?.map(({ user }, index) => (
        <Box
          key={user.account}
          marginLeft={index > 0 ? '-12px' : '0px'}
          bg={index ? 'grey.100' : 'unset'}
          p={index ? '1px' : 'unset'}
          borderRadius={index ? '100%' : 'unset'}
          overflow={index ? 'hidden' : 'unset'}
        >
          <Avatar account={user.account || ''} avatarUrl={user.imageURI} />
        </Box>
      ))}
    </>
  )
})

UniqueTraders.displayName = 'UniqueTraders'
