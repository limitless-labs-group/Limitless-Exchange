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
      <Box display='flex' alignItems='center'>
        {uniqueUsersTrades?.map(({ user }, index) => (
          <Box
            key={index}
            position='relative'
            ml={index === 0 ? 0 : -2} // Negative margin for overlap
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              backgroundColor: 'black', // Adjust to match your design
              opacity: 0.01, // 1px opacity effect
              zIndex: -1,
            }}
          >
            <Avatar account={user.account || ''} avatarUrl={user.imageURI} />
          </Box>
        ))}
      </Box>
    </>
  )
})

UniqueTraders.displayName = 'UniqueTraders'
