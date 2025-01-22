import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import Avatar from '@/components/common/avatar'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import Paper from '@/components/common/paper'
import { MarketCardLink } from './market-card-link'
import { MarketProgressBar } from './market-progress-bar'
import { useMarketFeed } from '@/hooks/use-market-feed'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface DailyMarketCardProps {
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

export const MarketCard = ({ market, analyticParams }: DailyMarketCardProps) => {
  const [hovered, setHovered] = useState(false)
  const { onOpenMarketPage, market: selectedMarket } = useTradingService()
  const router = useRouter()
  const { data: marketFeedData } = useMarketFeed(market?.address || '')

  const onClickRedirectToMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    e.preventDefault()
    router.push(`?market=${market.address}`, { scroll: false })
    trackClicked(ClickEvent.MediumMarketBannerClicked, {
      marketCategory: market.category,
      marketAddress: market.address,
      marketType: 'single',
      marketTags: market.tags,
      ...analyticParams,
    })
    onOpenMarketPage(market)
  }

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

  const { trackClicked } = useAmplitude()

  useEffect(() => {
    if (selectedMarket && selectedMarket.address !== market.address) {
      setHovered(false)
    }
    if (!selectedMarket && hovered) {
      setHovered(false)
    }
  }, [selectedMarket, market])

  const content = (
    <Box
      w='full'
      bg={hovered ? 'grey.100' : 'unset'}
      rounded='12px'
      border='2px solid var(--chakra-colors-grey-100)'
      p='2px'
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        if (selectedMarket?.address !== market.address) {
          setHovered(false)
        }
      }}
      onClick={(event) => {
        onClickRedirectToMarket(event)
      }}
    >
      <Paper flex={1} w={'100%'} position='relative' cursor='pointer' p='14px' bg='unset'>
        <VStack w='full' gap='16px'>
          <Box w='full'>
            <Text {...headline} mt='12px' mb='32px'>
              {market.title}
            </Text>
            <MarketProgressBar value={market.prices[0]} />
          </Box>
          <Box w='full'>
            <HStack w='full' justifyContent='space-between'>
              <Box w='full'>
                <DailyMarketTimer
                  deadline={market.expirationTimestamp}
                  deadlineText={market.expirationDate}
                  {...paragraphRegular}
                  color='grey.500'
                />
              </Box>
              <HStack gap='4px'>
                <HStack gap='4px'>
                  <>
                    <HStack gap={0}>
                      {uniqueUsersTrades?.map(({ user }, index) => (
                        <Avatar
                          account={user.account || ''}
                          avatarUrl={user.imageURI}
                          key={index}
                          borderColor='grey.100'
                          zIndex={100 + index}
                          border='2px solid'
                          color='grey.100 !important'
                          showBorder
                          bg='grey.100'
                          size='20px'
                          style={{
                            border: '2px solid',
                            marginLeft: index > 0 ? '-6px' : 0,
                          }}
                        />
                      ))}
                    </HStack>
                    <Text {...paragraphRegular} color='grey.500'>
                      Value
                    </Text>
                    <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
                      {NumberUtil.convertWithDenomination(
                        +market.openInterestFormatted + +market.liquidityFormatted,
                        6
                      )}{' '}
                      {market.collateralToken.symbol}
                    </Text>
                    <OpenInterestTooltip iconColor='grey.500' />
                  </>
                </HStack>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Paper>
    </Box>
  )

  return <MarketCardLink marketAddress={market?.address}>{content}</MarketCardLink>
}
