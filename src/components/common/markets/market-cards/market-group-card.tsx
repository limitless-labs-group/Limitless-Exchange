import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { AxiosResponse } from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import { MarketCardProps } from '@/components/common/markets'
import { MarketCardLink } from '@/components/common/markets/market-cards/market-card-link'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import { MIN_CARD_HEIGHT } from '@/components/common/markets/market-cards/market-single-card'
import MarketGroupRow from '@/components/common/markets/market-group-row'
import { MarketFeedData, useMarketFeed } from '@/hooks/use-market-feed'
import { useUniqueUsersTrades } from '@/hooks/use-unique-users-trades'
import {
  ClickEvent,
  QuickBetClickedMetadata,
  useAccount,
  useAmplitude,
  useTradingService,
} from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

export const MarketGroupCard = ({
  variant = 'groupRow',
  market,
  analyticParams,
}: MarketCardProps) => {
  const [hovered, setHovered] = useState(false)

  const {
    onOpenMarketPage,
    market: selectedMarket,
    marketPageOpened,
    setMarket,
    setGroupMarket,
    setClobOutcome,
    setMarketPageOpened,
  } = useTradingService()
  // const { data: marketFeedData } = useMarketFeed(market)
  // const uniqueUsersTrades = useUniqueUsersTrades(marketFeedData)
  const uniqueUsersTrades = useUniqueUsersTrades({
    data: market.feedEvents ?? [],
  } as AxiosResponse<MarketFeedData[]>)
  const router = useRouter()
  const { trackClicked } = useAmplitude()
  const { closeAllAuthSidebarPages } = useAccount()

  const isShortCard = variant === 'grid'

  const onClickRedirectToMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    !isMobile && e.preventDefault()
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('market', market.slug)
    router.push(`?${searchParams.toString()}`, { scroll: false })
    closeAllAuthSidebarPages()
    trackClicked(ClickEvent.MediumMarketBannerClicked, {
      marketCategory: market.categories,
      marketAddress: market.slug,
      marketType: 'group',
      marketTags: market.tags,
      ...analyticParams,
    })

    !isMobile && onOpenMarketPage(market)
  }

  const handleOutcomeClicked = (
    e: React.MouseEvent<HTMLButtonElement>,
    marketToSet: Market,
    outcome: number
  ) => {
    trackClicked<QuickBetClickedMetadata>(ClickEvent.QuickBetClicked, {
      source: 'Main Page market group card',
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
    closeAllAuthSidebarPages()
    setGroupMarket(market)
    setMarket(marketToSet)
    setClobOutcome(outcome)
    if (!marketPageOpened) {
      setMarketPageOpened(true)
    }
  }

  const content = (
    <Box
      w='full'
      bg={hovered ? 'grey.100' : 'unset'}
      rounded='12px'
      border='3px solid var(--chakra-colors-grey-100)'
      p='2px'
      minH={MIN_CARD_HEIGHT[variant]}
      h='full'
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        if (selectedMarket?.slug !== market.slug) {
          setHovered(false)
        }
      }}
      onClick={(event) => {
        onClickRedirectToMarket(event)
      }}
      position='relative'
      overflow='hidden'
    >
      <Text {...headline} p='16px' textAlign='left'>
        {market.title}
      </Text>
      <VStack maxH='86px' px='16px' overflowY='auto' gap='8px' pt={0}>
        {market.markets?.map((marketInGroup) => (
          <MarketGroupRow
            market={marketInGroup}
            key={marketInGroup.slug}
            handleOutcomeClicked={handleOutcomeClicked}
          />
        ))}
      </VStack>
      <HStack
        bg={hovered ? 'grey.100' : 'grey.50'}
        width='full'
        p='16px'
        justifyContent='space-between'
      >
        <MarketCountdown
          deadline={market.expirationTimestamp}
          deadlineText={market.expirationDate}
          color='grey.500'
          showDays={false}
          hideText={isMobile || isShortCard}
          ended={market.status === MarketStatus.RESOLVED}
        />
        <HStack gap='4px'>
          <HStack gap='4px'>
            <>
              {!isShortCard ? (
                <HStack gap={0}>
                  {uniqueUsersTrades?.map(({ user }, index) => (
                    <Avatar
                      account={user.account || ''}
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
                  ))}
                </HStack>
              ) : null}
              <Text {...paragraphRegular} color='grey.500'>
                Volume
              </Text>
              <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
                {NumberUtil.convertWithDenomination(market.volumeFormatted || '0', 0)}{' '}
                {market.collateralToken?.symbol}
              </Text>
            </>
          </HStack>
        </HStack>
      </HStack>
    </Box>
  )
  return isMobile ? content : <MarketCardLink marketAddress={market.slug}>{content}</MarketCardLink>
}
