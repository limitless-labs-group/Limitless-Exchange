import { Box, Button, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import Avatar from '@/components/common/avatar'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import Paper from '@/components/common/paper'
import ProgressBar from '@/components/common/progress-bar'
import { MarketCardLink } from './market-card-link'
import { useMarketFeed } from '@/hooks/use-market-feed'
import TooltipIcon from '@/resources/icons/tooltip-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import {
  captionMedium,
  paragraphBold,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface DailyMarketCardProps {
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

export default function DailyMarketCard({ market, analyticParams }: DailyMarketCardProps) {
  const [hovered, setHovered] = useState(false)
  const { onOpenMarketPage, market: selectedMarket } = useTradingService()
  const router = useRouter()
  const { data: marketFeedData } = useMarketFeed(market.address)

  const onClickRedirectToMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    e.preventDefault()
    router.push(`?market=${market.address}`, { scroll: false })
    trackClicked(ClickEvent.MediumMarketBannerClicked, {
      ...analyticParams,
    })
    onOpenMarketPage(market, 'Medium Banner')
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

  const isLumy = market.category === 'Lumy'

  const { trackClicked } = useAmplitude()

  const handleLumyButtonClicked = (e: SyntheticEvent) => {
    e.stopPropagation()
    router.push('/lumy')
  }

  const deadlineLeftInPercent =
    ((market.expirationTimestamp - new Date().getTime()) /
      (market.expirationTimestamp - new Date(market.createdAt).getTime())) *
    100

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
      bg={
        isLumy
          ? 'linear-gradient(90deg, #5F1BEC 0%, #FF3756 27.04%, #FFCB00 99.11%)'
          : hovered
          ? 'grey.300'
          : 'grey.100'
      }
      rounded='12px'
      p='2px'
      _hover={{
        ...(!isLumy ? { bg: 'grey.300' } : {}),
      }}
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        if (selectedMarket?.address !== market.address) {
          setHovered(false)
        }
      }}
      onClick={(event) => {
        trackClicked(ClickEvent.MediumMarketBannerClicked, {
          ...analyticParams,
        })
        onClickRedirectToMarket(event)
        onOpenMarketPage(market, 'Medium Banner')
      }}
    >
      <Paper flex={1} w={'100%'} position='relative' cursor='pointer' p='14px'>
        <VStack w='full' gap='32px'>
          <Box w='full'>
            <HStack gap='8px' w='full'>
              <Box>
                <Text {...paragraphRegular} color='grey.500'>
                  Ends in
                </Text>
              </Box>
              <HStack gap='4px'>
                <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
                  <Box
                    h='100%'
                    w='100%'
                    borderRadius='100%'
                    bg={`conic-gradient(var(--chakra-colors-transparent-700) ${deadlineLeftInPercent.toFixed(
                      0
                    )}% 10%, var(--chakra-colors-transparent-200) ${deadlineLeftInPercent.toFixed(
                      0
                    )}% 100%)`}
                  />
                </Box>
                <DailyMarketTimer
                  deadline={market.expirationTimestamp}
                  {...paragraphRegular}
                  color='grey.500'
                />
              </HStack>
            </HStack>
            <Text {...paragraphBold} fontSize='20px' mt='4px'>
              {market.title}
            </Text>
          </Box>
          <Box w='full'>
            <HStack w='full' justifyContent='space-between' mb='4px'>
              <Text {...paragraphMedium} color='#0FC591'>
                Yes {market.prices[0]}% (Predicted to Happen)
              </Text>
              <Text {...paragraphMedium} color='#FF3756'>
                No {market.prices[1]}% (Unlikely to Happen)
              </Text>
            </HStack>
            <ProgressBar variant='market' value={market.prices[0]} />
          </Box>
          <Box w='full'>
            <Divider orientation='horizontal' borderColor='grey.200' color='grey.200' />
            <HStack w='full' mt='16px' justifyContent='space-between'>
              <Button
                variant='grey'
                bg={hovered ? 'grey.400' : 'grey.200'}
                py='8px'
                {...paragraphMedium}
                h='unset'
              >
                ⚖️ Join the Prediction
              </Button>
              <HStack gap='16px'>
                <HStack gap='4px'>
                  <Box {...paragraphRegular}>💧 </Box>
                  <Text {...paragraphRegular} color='grey.500'>
                    Liquidity {NumberUtil.convertWithDenomination(market.liquidityFormatted, 6)}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                </HStack>
                <HStack gap='4px'>
                  <HStack gap='4px'>
                    {uniqueUsersTrades?.map(({ user }, index) => (
                      <Box key={user.account} marginLeft={index > 0 ? '-12px' : '0px'}>
                        <Avatar account={user.account || ''} avatarUrl={user.imageURI} />
                      </Box>
                    ))}
                    <Text {...paragraphRegular} color='transparent.700'>
                      Volume
                    </Text>
                  </HStack>
                  <Text {...paragraphRegular} color='transparent.700'>
                    {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                </HStack>
              </HStack>
            </HStack>
          </Box>
        </VStack>
        {isLumy && (
          <Box
            position='absolute'
            top={0}
            left='calc(50% - 30px)'
            py='2px'
            px='4px'
            borderBottomLeftRadius='4px'
            borderBottomRightRadius='2px'
            bg={'linear-gradient(90deg, #FF444F -14%, #FF7A30 100%)'}
            onClick={handleLumyButtonClicked}
            className='lumy-button'
          >
            <HStack gap='8px' color='grey.white'>
              <Text {...captionMedium} color='grey.white'>
                LUMY AI
              </Text>
              <TooltipIcon width={16} height={16} />
            </HStack>
          </Box>
        )}
      </Paper>
    </Box>
  )

  return isLumy ? (
    content
  ) : (
    <MarketCardLink marketAddress={market.address}>{content}</MarketCardLink>
  )
}
