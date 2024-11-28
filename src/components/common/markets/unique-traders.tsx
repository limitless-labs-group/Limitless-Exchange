import { HStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import React from 'react'
import { useMarketFeed } from '@/hooks/use-market-feed'
import { useTradingService } from '@/services'
import Avatar from '../avatar'

type UniqueTradersProps = {
  color: string
}

export const UniqueTraders = React.memo(({ color }: UniqueTradersProps) => {
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
      <HStack gap={0}>
        {uniqueUsersTrades?.map(({ user }, index) => (
          <Avatar
            account={user.account || ''}
            avatarUrl={user.imageURI}
            key={index}
            borderColor={color}
            zIndex={100 + index}
            border='2px solid'
            size='20px'
            color={`${color} !important`}
            showBorder
            bg='grey.100'
            style={{
              border: '2px solid',
              marginLeft: index > 0 ? '-6px' : 0,
            }}
          />
        ))}
      </HStack>
    </>
  )
})

UniqueTraders.displayName = 'UniqueTraders'
