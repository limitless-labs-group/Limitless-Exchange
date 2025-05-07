import { Box, HStack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import PieChartIcon from '@/resources/icons/pie-chart-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { captionRegular } from '@/styles/fonts/fonts.styles'
import { FeedEntity, Market, MarketNewTradeFeedData } from '@/types'
import { NumberUtil } from '@/utils'

interface MarketFeedTradeCardProps {
  data: FeedEntity<MarketNewTradeFeedData>
}

export default function MarketFeedTradeCard({ data }: MarketFeedTradeCardProps) {
  const { onOpenMarketPage } = useTradingService()
  const { trackClicked } = useAmplitude()
  const eventTitle = useMemo(() => {
    const title = data.data.strategy === 'Buy' ? 'Bought' : 'Sold'
    const outcome = data.data.outcome
    return `${title} ${NumberUtil.toFixed(
      data.data.contracts,
      6
    )} contracts ${outcome} for ${NumberUtil.convertWithDenomination(
      Math.abs(+data.data.tradeAmount),
      6,
      data.data.symbol
    )} ${data.data.symbol} in total.`
  }, [data])

  const { data: market } = useMarket(data.data.address || data.data.slug)

  const content = (
    <HStack gap='4px' color='grey.500'>
      <PieChartIcon width={14} height={14} />
      <Box
        cursor='pointer'
        maxW='calc(100% - 22px)'
        borderBottom='1px solid'
        borderColor='greyTransparent.200'
        _hover={{
          borderColor: 'greyTransparent.600',
        }}
        onClick={() => {
          onOpenMarketPage(market as Market)
          trackClicked(ClickEvent.FeedMarketClicked, {
            marketAddress: market?.slug,
            marketType: 'single',
            marketTags: market?.tags,
          })
        }}
      >
        <Text
          {...captionRegular}
          color='grey.500'
          textOverflow='ellipsis'
          whiteSpace='nowrap'
          overflow='hidden'
        >
          {data.data.title}
        </Text>
      </Box>
    </HStack>
  )

  return (
    <MarketFeedCardContainer
      user={data.user}
      eventType={data.eventType}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={eventTitle}
    >
      {isMobile ? (
        <Box
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <MobileDrawer trigger={content} variant='black'>
            <MarketPage />
          </MobileDrawer>
        </Box>
      ) : (
        content
      )}
    </MarketFeedCardContainer>
  )
}
