import { Box, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import MobileDrawer from '@/components/common/drawer'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import MarketPage from '@/components/common/markets/market-page'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import ProgressBar from '@/components/common/progress-bar'
import { MarketCardLink } from './market-cards/market-card-link'
import { MarketFeedData, useMarketFeed } from '@/hooks/use-market-feed'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { h1Bold, h2Bold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { defineOpenInterestOverVolume } from '@/utils/market'
import { cutUsername } from '@/utils/string'

const MotionBox = motion(Box)

interface BigBannerProps {
  market: Market
  markets: Market[]
}

export default function BigBanner({ market, markets }: BigBannerProps) {
  const [feedMessage, setFeedMessage] = useState<MarketFeedData | null>(null)
  const { onCloseMarketPage, onOpenMarketPage, setMarkets } = useTradingService()
  const { data: marketFeedData } = useMarketFeed(market.address)
  const router = useRouter()
  const { trackClicked } = useAmplitude()

  const onClickRedirectToMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    if (!isMobile) {
      e.preventDefault()
    }
    router.push(`?market=${market.address}`, { scroll: false })
    trackClicked(ClickEvent.BigBannerClicked, {
      marketCategory: market.category,
      marketAddress: market.address,
      marketType: 'single',
      marketTags: market.tags,
    })
    onOpenMarketPage(market)
    if (isMobile) {
      setMarkets(markets)
    }
  }

  useEffect(() => {
    if (!feedMessage && marketFeedData?.data?.length) {
      setFeedMessage(marketFeedData.data[0])
      return
    }
    if (
      feedMessage &&
      marketFeedData?.data?.length &&
      marketFeedData.data[0].bodyHash !== feedMessage.bodyHash
    ) {
      setFeedMessage(marketFeedData.data[0])
      return
    }
  }, [feedMessage, marketFeedData])

  const fetMarketFeedTitle = (message: MarketFeedData | null) => {
    if (message && feedMessage === message) {
      const title = message.data.strategy === 'Buy' ? 'bought' : 'sold'
      const outcome = message.data.outcome
      return (
        <HStack gap='2px'>
          <Text
            {...paragraphMedium}
            color='white'
            maxW='20%'
            whiteSpace='nowrap'
            overflow='hidden'
            textOverflow='ellipsis'
          >
            {ethers.utils.isAddress(feedMessage?.user?.name ?? '')
              ? truncateEthAddress(feedMessage?.user?.account)
              : feedMessage?.user?.name
              ? cutUsername(feedMessage.user.name, 25)
              : truncateEthAddress(feedMessage?.user?.account)}
          </Text>
          <Text
            {...paragraphMedium}
            color='white'
          >{`${title} ${outcome} outcome for ${NumberUtil.convertWithDenomination(
            Math.abs(+message.data.tradeAmount),
            6
          )} ${message.data.symbol}.`}</Text>
        </HStack>
      )
    }
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

  const content = (
    <VStack
      w='full'
      justifyContent='space-between'
      backgroundImage='url("/assets/images/top-market-bg.png")'
      backgroundSize='100% 100%'
      p='16px'
      borderRadius='8px'
      h={isMobile ? '232px' : '324px'}
      cursor='pointer'
      onClick={(e) => onClickRedirectToMarket(e)}
    >
      <Box w='full'>
        <DailyMarketTimer
          deadline={market.expirationTimestamp}
          deadlineText={market.expirationDate}
          topMarket={true}
          {...paragraphRegular}
          color='transparent.700'
        />
      </Box>
      <Text {...(isMobile ? h2Bold : h1Bold)} color='white' textAlign='left'>
        {market.proxyTitle ?? market.title ?? 'Noname market'}
      </Text>
      <Box w='full' h='38px'></Box>
      <Box w='full'>
        <HStack w='full' justifyContent='space-between' mb='4px'>
          <Text {...paragraphMedium} color='white'>
            Yes {market.prices[0]}%
          </Text>
          <Text {...paragraphMedium} color='white'>
            No {market.prices[1]}%
          </Text>
        </HStack>
        <ProgressBar value={market.prices[0]} variant='white' />
        {!isMobile && (
          <Divider
            orientation='horizontal'
            mt={'12px'}
            mb='8px'
            w='full'
            bg='transparent.200'
            borderColor='transparent.200'
          />
        )}
        {isMobile ? (
          <HStack w='full' justifyContent='space-between' mt='8px'>
            <Box />
            <HStack gap='4px'>
              {defineOpenInterestOverVolume(market.openInterestFormatted, market.liquidityFormatted)
                .showOpenInterest ? (
                <>
                  <HStack gap={0}>
                    {uniqueUsersTrades?.map(({ user }, index) => (
                      <Avatar
                        account={user.account || ''}
                        avatarUrl={user.imageURI}
                        key={index}
                        borderColor='#7e4070'
                        zIndex={100 + index}
                        border='2px solid'
                        size='20px'
                        color='#7e4070 !important'
                        showBorder
                        bg='#7e4070'
                        style={{
                          border: '2px solid',
                          marginLeft: index > 0 ? '-6px' : 0,
                        }}
                      />
                    ))}
                  </HStack>
                  <Text {...paragraphRegular} color='transparent.700'>
                    Value{' '}
                    {NumberUtil.convertWithDenomination(
                      +market.openInterestFormatted + +market.liquidityFormatted,
                      6
                    )}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                  <Box zIndex={400}>
                    <OpenInterestTooltip iconColor='transparent.700' />
                  </Box>
                </>
              ) : (
                <>
                  <Box {...paragraphRegular}>💧 </Box>
                  <Text {...paragraphRegular} color='transparent.700'>
                    Liquidity{' '}
                    {NumberUtil.convertWithDenomination(
                      +market.openInterestFormatted + +market.liquidityFormatted,
                      6
                    )}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                  <OpenInterestTooltip iconColor='grey.500' />
                </>
              )}
            </HStack>
          </HStack>
        ) : (
          <HStack w='full' justifyContent='space-between'>
            {feedMessage ? (
              <Box>
                <AnimatePresence>
                  <MotionBox
                    initial={{ y: -48, opacity: 0 }}
                    animate={{ y: -8, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    position='absolute'
                    width='100%'
                    display='flex'
                    alignItems='center'
                    gap='8px'
                    key={feedMessage.bodyHash}
                  >
                    <HStack gap='4px' alignItems='flex-start'>
                      <Avatar
                        account={feedMessage?.user?.account ?? ''}
                        avatarUrl={feedMessage.user?.imageURI}
                      />
                      {fetMarketFeedTitle(feedMessage)}
                    </HStack>
                  </MotionBox>
                </AnimatePresence>
              </Box>
            ) : (
              <Box />
            )}
            <HStack gap='4px'>
              {defineOpenInterestOverVolume(market.openInterestFormatted, market.liquidityFormatted)
                .showOpenInterest ? (
                <>
                  <HStack gap={0}>
                    {uniqueUsersTrades?.map(({ user }, index) => (
                      <Avatar
                        account={user.account || ''}
                        avatarUrl={user.imageURI}
                        key={index}
                        borderColor='#7e4070'
                        zIndex={100 + index}
                        border='2px solid'
                        size='20px'
                        color='#7e4070 !important'
                        showBorder
                        bg='#7e4070'
                        style={{
                          border: '2px solid',
                          marginLeft: index > 0 ? '-6px' : 0,
                        }}
                      />
                    ))}
                  </HStack>
                  <Text {...paragraphRegular} color='transparent.700'>
                    Value{' '}
                    {NumberUtil.convertWithDenomination(
                      +market.openInterestFormatted + +market.liquidityFormatted,
                      6
                    )}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                  <Box zIndex={400}>
                    <OpenInterestTooltip iconColor='transparent.700' />
                  </Box>
                </>
              ) : (
                <>
                  <Box {...paragraphRegular}>💧 </Box>
                  <Text {...paragraphRegular} color='transparent.700'>
                    Liquidity {NumberUtil.convertWithDenomination(market.liquidityFormatted, 6)}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                </>
              )}
            </HStack>
          </HStack>
        )}
      </Box>
    </VStack>
  )

  return isMobile ? (
    <MobileDrawer id={market.address} trigger={content} variant='black' onClose={onCloseMarketPage}>
      <MarketPage />
    </MobileDrawer>
  ) : (
    <MarketCardLink marketAddress={market.address}>{content}</MarketCardLink>
  )
}
