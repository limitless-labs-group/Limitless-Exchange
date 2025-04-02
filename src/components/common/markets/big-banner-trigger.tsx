import { Box, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import MarketTimer from '@/components/common/markets/market-cards/market-timer'
import ProgressBar from '@/components/common/progress-bar'
import { BigBannerProps } from './big-banner'
import { MarketFeedData, useMarketFeed } from '@/hooks/use-market-feed'
import { useUniqueUsersTrades } from '@/hooks/use-unique-users-trades'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { h1Bold, h2Bold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { cutUsername } from '@/utils/string'

// @ts-ignore
const MotionBox = motion(Box)

export const BigBannerTrigger = React.memo(({ market, markets }: BigBannerProps) => {
  const [feedMessage, setFeedMessage] = useState<MarketFeedData | null>(null)
  const { onOpenMarketPage, setMarkets } = useTradingService()
  const { data: marketFeedData } = useMarketFeed(market)
  const router = useRouter()
  const { trackClicked } = useAmplitude()
  const { pushGA4Event } = useGoogleAnalytics()

  const onClickRedirectToMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    if (!isMobile) {
      e.preventDefault()
    }
    router.push(`?market=${market.slug}`, { scroll: false })
    trackClicked(ClickEvent.BigBannerClicked, {
      marketAddress: market.slug,
      marketType: 'single',
      marketTags: market.tags,
    })
    pushGA4Event(GAEvents.ClickSection)
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
      return `${
        ethers.utils.isAddress(feedMessage?.user?.name ?? '')
          ? truncateEthAddress(feedMessage?.user?.account)
          : feedMessage?.user?.name
          ? cutUsername(feedMessage.user.name, 25)
          : truncateEthAddress(feedMessage?.user?.account)
      }
         ${title} ${outcome} outcome for ${NumberUtil.convertWithDenomination(
        Math.abs(+message.data.tradeAmount),
        6
      )} ${message.data.symbol}.`
    }
  }

  const uniqueUsersTrades = useUniqueUsersTrades(marketFeedData)

  return (
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
        <MarketCountdown
          deadline={market.expirationTimestamp}
          deadlineText={market.expirationDate}
          topMarket={true}
          {...paragraphRegular}
          color='whiteAlpha.70'
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
            bg='whiteAlpha.20'
            borderColor='whiteAlpha.20'
          />
        )}
        {isMobile ? (
          <HStack w='full' justifyContent='space-between'>
            <HStack gap='4px' mt='8px'>
              <HStack gap={0}>
                {uniqueUsersTrades?.map(({ user }, index) => (
                  <Avatar
                    account={user.account || ''}
                    avatarUrl={user.imageURI}
                    key={index}
                    borderColor='#4905a1'
                    zIndex={100 + index}
                    border='2px solid'
                    size='20px'
                    color='#4905a1 !important'
                    showBorder
                    bg='#4905a1'
                    style={{
                      border: '2px solid',
                      marginLeft: index > 0 ? '-6px' : 0,
                    }}
                  />
                ))}
              </HStack>
              <Text {...paragraphRegular} color='whiteAlpha.70'>
                Volume
              </Text>
            </HStack>
            <Text {...paragraphRegular} color='whiteAlpha.70'>
              {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
              {market.collateralToken.symbol}
            </Text>
          </HStack>
        ) : (
          <HStack w='full' justifyContent='space-between'>
            {feedMessage && (
              <Box>
                <AnimatePresence>
                  <MotionBox
                    width='100%'
                    display='flex'
                    alignItems='center'
                    gap='8px'
                    key={feedMessage.bodyHash}
                  >
                    <HStack gap='4px' alignItems='end'>
                      <Avatar
                        account={feedMessage?.user?.account ?? ''}
                        avatarUrl={feedMessage?.user?.imageURI}
                      />
                      <Text {...paragraphMedium} color='white' mt='-2px'>
                        {fetMarketFeedTitle(feedMessage)}
                      </Text>
                    </HStack>
                  </MotionBox>
                </AnimatePresence>
              </Box>
            )}
            {
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='whiteAlpha.70'>
                  {market.tradeType === 'amm' ? 'Value' : 'Volume'}{' '}
                  {market.tradeType === 'amm'
                    ? NumberUtil.convertWithDenomination(
                        Number(market.openInterestFormatted || 0) +
                          Number(market.liquidityFormatted || 0),
                        6
                      )
                    : NumberUtil.convertWithDenomination(Number(market.volumeFormatted), 6)}{' '}
                  {market.collateralToken.symbol}
                </Text>
              </HStack>
            }
          </HStack>
        )}
      </Box>
    </VStack>
  )
})

BigBannerTrigger.displayName = 'BigBannerTrigger '
