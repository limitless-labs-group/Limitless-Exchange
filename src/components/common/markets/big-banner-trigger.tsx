import { Box, Button, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import { MarketProgressBar } from '@/components/common/markets/market-cards/market-progress-bar'
import { MIN_CARD_HEIGHT } from '@/components/common/markets/market-cards/market-single-card'
import { SpeedometerProgress } from '@/components/common/markets/market-cards/speedometer-progress'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import Paper from '@/components/common/paper'
import ProgressBar from '@/components/common/progress-bar'
import { LineChart } from '@/app/(markets)/markets/[address]/components/line-chart'
import { MarketFeedData, useMarketFeed } from '@/hooks/use-market-feed'
import { useUniqueUsersTrades } from '@/hooks/use-unique-users-trades'
import { ClickEvent, QuickBetClickedMetadata, useAmplitude, useTradingService } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import {
  captionMedium,
  h1Bold,
  h2Bold,
  headline,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { cutUsername } from '@/utils/string'

// @ts-ignore
const MotionBox = motion(Box)

export interface BigBannerProps {
  market: Market
  markets: Market[]
  index: number
}

export const BigBannerTrigger = React.memo(({ market, markets, index }: BigBannerProps) => {
  const [feedMessage, setFeedMessage] = useState<MarketFeedData | null>(null)
  const {
    onOpenMarketPage,
    setMarkets,
    setClobOutcome,
    setMarket,
    marketPageOpened,
    setMarketPageOpened,
  } = useTradingService()
  const { data: marketFeedData } = useMarketFeed(market)
  const router = useRouter()
  const { trackClicked } = useAmplitude()
  const { pushGA4Event } = useGoogleAnalytics()
  const [yesHovered, setYesHovered] = useState(false)
  const [noHovered, setNoHovered] = useState(false)

  const imageBackgrounds = [
    '/assets/images/banners/background-1.svg',
    '/assets/images/banners/background-2.svg',
    '/assets/images/banners/background-3.svg',
    '/assets/images/banners/background-4.svg',
    '/assets/images/banners/background-5.svg',
    '/assets/images/banners/background-6.svg',
    '/assets/images/banners/background-7.svg',
    '/assets/images/banners/background-8.svg',
    '/assets/images/banners/background-9.svg',
  ]

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

  const handleOutcomeClicked = (e: React.MouseEvent<HTMLButtonElement>, outcome: number) => {
    trackClicked<QuickBetClickedMetadata>(ClickEvent.QuickBetClicked, {
      source: 'Main page' + ' ' + market.tradeType + 'card',
      value: outcome ? 'small no button' : 'small yes button',
    })
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    if (!isMobile) {
      e.stopPropagation()
      e.preventDefault()
    }
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('market', market.slug)
    router.push(`?${searchParams.toString()}`, { scroll: false })
    setMarket(market)
    setClobOutcome(outcome)
    if (!marketPageOpened) {
      setMarketPageOpened(true)
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
    <Box
      w='full'
      backgroundImage={imageBackgrounds[index]}
      backgroundSize='cover'
      backgroundPosition='center'
      backgroundRepeat='no-repeat'
      rounded='12px'
      p='16px'
      h='180px'
      onClick={(event) => {
        onClickRedirectToMarket(event)
      }}
    >
      <Paper flex={1} p={0} w='full' position='relative' cursor='pointer' bg='unset' h='full'>
        <Box w='full'>
          <MarketCountdown
            hideText={false}
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
            {...paragraphRegular}
            color='whiteAlpha.50'
          />
        </Box>
        <VStack w='full' h='calc(100% - 18px)' gap={0} justifyContent='space-between'>
          <Flex
            w='full'
            alignItems='center'
            marginTop='8px'
            gap='12px'
            justifyContent='space-between'
          >
            <Text {...headline} color='white'>
              {market.title}
            </Text>
          </Flex>
          <Box w='full'>
            <MarketProgressBar
              isClosed={market.expired}
              value={market.prices[0]}
              noColor='whiteAlpha.50'
              variant='white'
            />
            <HStack w='full' mt='16px' justifyContent='space-between'>
              <HStack gap='4px'>
                <HStack gap='4px'>
                  <>
                    <HStack gap={0}>
                      {uniqueUsersTrades?.map(({ user }, index) => {
                        console.log(user)
                        return (
                          <Avatar
                            account={user.account}
                            avatarUrl={user.imageURI}
                            key={user.account}
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
                        )
                      })}
                    </HStack>
                    <Text {...paragraphRegular} color='grey.500'>
                      {market.tradeType === 'clob' ? 'Volume' : 'Value'}
                    </Text>
                    <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
                      {NumberUtil.convertWithDenomination(
                        market.tradeType === 'clob'
                          ? market.volumeFormatted
                          : +market.openInterestFormatted + +market.liquidityFormatted,
                        6
                      )}{' '}
                      {market.collateralToken.symbol}
                    </Text>
                    {market.tradeType !== 'clob' && <OpenInterestTooltip iconColor='grey.500' />}
                  </>
                </HStack>
              </HStack>
              <HStack gap='8px'>
                <Button
                  {...captionMedium}
                  h='20px'
                  px='4px'
                  py='2px'
                  color={yesHovered ? 'white' : 'green.500'}
                  bg={yesHovered ? 'green.500' : 'greenTransparent.100'}
                  onMouseEnter={() => setYesHovered(true)}
                  onMouseLeave={() => setYesHovered(false)}
                  onClick={(e) => handleOutcomeClicked(e, 0)}
                >
                  {yesHovered
                    ? `${new BigNumber(market.prices[0]).decimalPlaces(0).toString()}%`
                    : 'YES'}
                </Button>
                <Button
                  {...captionMedium}
                  h='20px'
                  px='4px'
                  py='2px'
                  color={noHovered ? 'white' : 'red.500'}
                  bg={noHovered ? 'red.500' : 'redTransparent.100'}
                  onMouseEnter={() => setNoHovered(true)}
                  onMouseLeave={() => setNoHovered(false)}
                  onClick={(e) => handleOutcomeClicked(e, 1)}
                >
                  {noHovered
                    ? `${new BigNumber(market.prices[1]).decimalPlaces(0).toString()}%`
                    : 'NO'}
                </Button>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Paper>
    </Box>
  )
})

BigBannerTrigger.displayName = 'BigBannerTrigger '
