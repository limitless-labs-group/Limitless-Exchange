import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import MarketPage from '@/components/common/markets/market-page'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { ClickEvent, QuickBetClickedMetadata, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { captionMedium, headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { GroupFeedData, FeedEntity, FeedMarketGroupEntity } from '@/types'
import { NumberUtil } from '@/utils'

interface FeedGroupClosedProps {
  data: FeedEntity<GroupFeedData>
}

export default function FeedGroupCreated({ data }: FeedGroupClosedProps) {
  const [hovered, setHovered] = useState(false)
  const sortedMarkets = data.data.markets.sort((a, b) => b.winningIndex - a.winningIndex)
  const {
    market: selectedMarket,
    onOpenMarketPage,
    onCloseMarketPage,
    setMarket,
    setGroupMarket,
    setClobOutcome,
    marketPageOpened,
    setMarketPageOpened,
  } = useTradingService()
  const { trackClicked } = useAmplitude()

  const { data: market, refetch: refetchMarket } = useMarket(data.data.slug, false, false)

  const onClickRedirectToMarket = async () => {
    trackClicked(ClickEvent.FeedClosedMarketGroupClicked, {
      marketAddress: data.data.slug,
      marketType: 'group',
    })
    if (selectedMarket?.slug === market?.slug && marketPageOpened) {
      return
    }
    const { data: fetchedMarket } = await refetchMarket()
    if (fetchedMarket) {
      onOpenMarketPage(fetchedMarket)
    }
  }

  const totalVolumeFormatted = data.data.markets.reduce(
    (acc, b) => new BigNumber(acc).plus(b.volumeFormatted).decimalPlaces(0).toNumber(),
    0
  )

  const handleOutcomeClicked = async (
    e: React.MouseEvent<HTMLButtonElement>,
    marketToSet: string,
    outcome: number
  ) => {
    trackClicked<QuickBetClickedMetadata>(ClickEvent.QuickBetClicked, {
      source: 'Feed',
      value: outcome ? 'small no button' : 'small yes button',
    })
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    if (!isMobile) {
      e.stopPropagation()
      e.preventDefault()
    }
    if (market?.slug === data.data.slug) {
      const marketInGroup = market.markets?.find((market) => market.slug === marketToSet)
      setGroupMarket(market)
      setMarket(marketInGroup || null)
      setClobOutcome(outcome)
      if (!marketPageOpened) {
        setMarketPageOpened(true)
      }
      return
    }
    const { data: fetchedMarket } = await refetchMarket()
    if (fetchedMarket) {
      const marketInGroup = fetchedMarket.markets?.find((market) => market.slug === marketToSet)
      setGroupMarket(fetchedMarket)
      setMarket(marketInGroup || null)
      setClobOutcome(outcome)
      if (!marketPageOpened) {
        setMarketPageOpened(true)
      }
    }
  }

  useEffect(() => {
    return () => onCloseMarketPage()
  }, [])

  const options = { year: 'numeric', month: 'short', day: 'numeric' }

  //@ts-ignore
  const convertedDate = new Date(data.data.deadline).toLocaleDateString('en-US', options)

  const content = (
    <Box
      w='full'
      bg={hovered ? 'grey.100' : 'unset'}
      rounded='12px'
      border='3px solid var(--chakra-colors-grey-100)'
      p='2px'
      minH='196px'
      h='full'
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        if (selectedMarket?.slug !== data.data.slug) {
          setHovered(false)
        }
      }}
      onClick={onClickRedirectToMarket}
      position='relative'
      overflow='hidden'
      cursor='pointer'
    >
      <Text {...headline} p='16px' textAlign='left'>
        {data.data.name}
      </Text>
      <VStack maxH={`92px`} p='16px' overflowY='auto' gap='8px' pt={0}>
        {sortedMarkets.map((market) => (
          <FeedGroupRow
            market={market}
            handleOutcomeClicked={handleOutcomeClicked}
            key={market.slug}
          />
        ))}
      </VStack>
      <HStack
        position='absolute'
        bg={hovered ? 'grey.100' : 'grey.50'}
        bottom={0}
        width='full'
        p='16px'
        justifyContent='space-between'
      >
        <MarketCountdown
          deadline={new Date(data.data.deadline).getTime()}
          deadlineText={convertedDate}
          color='grey.500'
          showDays={false}
          hideText={false}
          ended={new Date(data.data.deadline).getTime() < new Date().getTime()}
        />
        <HStack gap='4px'>
          <Text {...paragraphRegular} color='grey.500'>
            Volume
          </Text>
          <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
            {NumberUtil.convertWithDenomination(totalVolumeFormatted, 6)}{' '}
            {data.data.collateralToken.symbol}
          </Text>
        </HStack>
      </HStack>
    </Box>
  )

  return (
    <MarketFeedCardContainer
      user={data.user}
      eventType={data.eventType}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title='Created market'
    >
      {isMobile ? (
        <MobileDrawer trigger={content} variant='black'>
          <MarketPage />
        </MobileDrawer>
      ) : (
        content
      )}
    </MarketFeedCardContainer>
  )
}

const FeedGroupRow = ({
  market,
  handleOutcomeClicked,
}: {
  market: FeedMarketGroupEntity
  handleOutcomeClicked: (
    e: React.MouseEvent<HTMLButtonElement>,
    marketToSet: string,
    outcome: number
  ) => void
}) => {
  const [yesHovered, setYesHovered] = useState(false)
  const [noHovered, setNoHovered] = useState(false)

  return (
    <HStack w='full' justifyContent='space-between' py='4px' key={market.slug}>
      <Text {...paragraphRegular}>{market.title}</Text>
      <HStack gap='8px'>
        <HStack gap='4px'>
          <Button
            {...captionMedium}
            h='20px'
            px='4px'
            py='2px'
            color={yesHovered ? 'white' : 'green.500'}
            bg={yesHovered ? 'green.500' : 'greenTransparent.100'}
            onMouseEnter={() => setYesHovered(true)}
            onMouseLeave={() => setYesHovered(false)}
            onClick={(e) => handleOutcomeClicked(e, market.slug, 0)}
          >
            YES
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
            onClick={(e) => handleOutcomeClicked(e, market.slug, 1)}
          >
            NO
          </Button>
        </HStack>
      </HStack>
    </HStack>
  )
}
