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
        <>
          {index > 0 && index + 1 < uniqueUsersTrades?.length && (
            <Box p='1px' borderRadius='100%' ml='-12px' />
          )}
          <Box key={user.account} marginLeft={index > 0 ? '-12px' : '0px'}>
            <Avatar account={user.account || ''} avatarUrl={user.imageURI} />
          </Box>
        </>
      ))}
    </>
  )
})

UniqueTraders.displayName = 'UniqueTraders'
