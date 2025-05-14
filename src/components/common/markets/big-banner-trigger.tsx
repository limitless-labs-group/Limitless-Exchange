import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import { MarketProgressBar } from '@/components/common/markets/market-cards/market-progress-bar'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import Paper from '@/components/common/paper'
import { MarketFeedData, useMarketFeed } from '@/hooks/use-market-feed'
import { useUniqueUsersTrades } from '@/hooks/use-unique-users-trades'
import { ClickEvent, QuickBetClickedMetadata, useAmplitude, useTradingService } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { captionMedium, headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

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
    setGroupMarket,
  } = useTradingService()
  const { data: marketFeedData } = useMarketFeed(market)
  const router = useRouter()
  const { trackClicked } = useAmplitude()
  const { pushGA4Event } = useGoogleAnalytics()
  const [yesHovered, setYesHovered] = useState(false)
  const [noHovered, setNoHovered] = useState(false)
  const isGroup = market.marketType === 'group'

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
    '/assets/images/banners/background-10.svg',
    '/assets/images/banners/background-11.svg',
    '/assets/images/banners/background-12.svg',
  ]

  const cardBackgrounds = [
    'linear-gradient(247deg, #822E25 0%, #010101 64.82%)',
    'linear-gradient(247deg, #5041A3 0%, #010101 64.82%)',
    'linear-gradient(247deg, #418D8B 0%, #010101 64.82%)',
    'linear-gradient(247deg, #C28732 0%, #010101 64.82%)',
    'linear-gradient(247deg, #275D38 0%, #010101 64.82%)',
    'linear-gradient(247deg, #A34924 0%, #010101 64.82%)',
    'linear-gradient(247deg, #2C69A3 0%, #010101 64.82%)',
    'linear-gradient(247deg, #753379 0%, #010101 64.82%)',
    'linear-gradient(247deg, #2A636E 0%, #010101 64.82%)',
    'linear-gradient(247deg, #5041A3 0%, #010101 64.82%)',
    'linear-gradient(247deg, #B2682B 0%, #010101 64.82%)',
    'linear-gradient(247deg, #B04F50 0%, #010101 64.82%)',
  ]

  const cardBorders = [
    'rgba(130, 46, 37, 0.25)',
    'rgba(80, 65, 163, 0.25)',
    'rgba(65, 141, 139, 0.25)',
    'rgba(194, 135, 50, 0.25)',
    'rgba(39, 93, 56, 0.25)',
    'rgba(163, 73, 36, 0.25)',
    'rgba(44, 105, 163, 0.25)',
    'rgba(117, 51, 121, 0.25)',
    'rgba(42, 99, 110, 0.25)',
    'rgba(80, 65, 163, 0.25)',
    'rgba(178, 104, 43, 0.25)',
    'rgba(176, 79, 80, 0.25)',
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
      marketType: market.marketType,
      marketTags: market.tags,
    })
    pushGA4Event(GAEvents.ClickSection)
    onOpenMarketPage(market)
    if (isMobile) {
      setMarkets(markets)
    }
  }

  const handleOutcomeClicked = (e: React.MouseEvent<HTMLButtonElement>, outcome: number) => {
    const getValue = () => {
      if (isGroup) return 'predict button'
      return outcome ? 'small no button' : 'small yes button'
    }

    trackClicked<QuickBetClickedMetadata>(ClickEvent.QuickBetClicked, {
      source: 'Main page' + ' ' + market.tradeType + 'card',
      value: getValue(),
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
    if (market.negRiskMarketId) {
      setGroupMarket(market)
      setMarket(market?.markets?.[0] || null)
    } else {
      setMarket(market)
    }
    if (!isGroup) {
      setClobOutcome(outcome)
    }
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

  const uniqueUsersTrades = useUniqueUsersTrades(marketFeedData)

  return (
    <Box
      w='full'
      rounded='12px'
      h='180px'
      onClick={(event) => {
        onClickRedirectToMarket(event)
      }}
      border='2px solid'
      borderColor={cardBorders[index]}
      overflow='hidden'
      // bg={cardBackgrounds[index]}
    >
      <Paper
        flex={1}
        p='16px'
        w='101%'
        position='relative'
        cursor='pointer'
        h='full'
        bg={cardBackgrounds[index]}
        backgroundImage={imageBackgrounds[index]}
        backgroundSize='cover'
        backgroundPosition='center'
        backgroundRepeat='no-repeat'
        borderRadius={0}
        ml='-1px'
      >
        <Box w='full'>
          <MarketCountdown
            hideText={false}
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
            {...paragraphRegular}
            color='whiteAlpha.50'
            ended={market.status === MarketStatus.RESOLVED}
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
            <Text {...headline} color='white' textAlign='left'>
              {market.title}
            </Text>
          </Flex>
          <Box w='full'>
            {!isGroup ? (
              <MarketProgressBar
                isClosed={market.expired}
                value={market.prices[0]}
                noColor='whiteAlpha.50'
                variant='white'
              />
            ) : null}
            <HStack w='full' mt='16px' justifyContent='space-between'>
              <HStack gap='4px'>
                <HStack gap='4px'>
                  <>
                    <HStack gap={0}>
                      {uniqueUsersTrades?.map(({ user }, index) => {
                        return (
                          <Avatar
                            account={user.account}
                            avatarUrl={user.imageURI}
                            key={user.account}
                            zIndex={100 + index}
                            boxShadow='-1px 0px 0px 1px rgba(0,0,0,1)'
                            color='unset !important'
                            showBorder={false}
                            bg='black'
                            size='20px'
                            style={{
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
                        0
                      )}{' '}
                      {market.collateralToken.symbol}
                    </Text>
                    {market.tradeType !== 'clob' && <OpenInterestTooltip iconColor='grey.500' />}
                  </>
                </HStack>
              </HStack>
              <HStack gap='8px'>
                {isGroup ? (
                  <Button
                    {...captionMedium}
                    h='20px'
                    px='8px'
                    py='4px'
                    color='white'
                    bg={'whiteAlpha.20'}
                    onClick={(e) => handleOutcomeClicked(e, 0)}
                  >
                    Predict
                  </Button>
                ) : (
                  <>
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
                  </>
                )}
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Paper>
    </Box>
  )
})

BigBannerTrigger.displayName = 'BigBannerTrigger '
