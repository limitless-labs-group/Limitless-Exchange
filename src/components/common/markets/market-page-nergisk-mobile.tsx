import {
  Box,
  Divider,
  HStack,
  Image as ChakraImage,
  Link,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { LegacyRef, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { Address } from 'viem'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import ClobWidget from '@/components/common/markets/clob-widget/clob-widget'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import MarketPageOverviewTab from '@/components/common/markets/market-page-overview-tab'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import ShareMenu from '@/components/common/markets/share-menu'
import MarketClosedWidget from '@/components/common/markets/trading-widgets/market-closed-widget'
import WinnerTakeAllTooltip from '@/components/common/markets/winner-take-all-tooltip'
import Skeleton from '@/components/common/skeleton'
import GroupMarketSectionTabs from '@/app/(markets)/markets/[address]/components/group-market-section-tabs'
import CommentTab from './comment-tab'
import { UniqueTraders } from './unique-traders'
import usePageName from '@/hooks/use-page-name'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { ClickEvent, OpenEvent, PageOpenedPage, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { h2Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

export default function MarketPageNergiskMobile() {
  const [activeActionsTabIndex, setActiveActionsTabIndex] = useState(0)

  const scrollableBlockRef: LegacyRef<HTMLDivElement> | null = useRef(null)

  const {
    setMarket,
    onCloseMarketPage,
    market,
    setStrategy,
    refetchMarkets,
    setGroupMarket,
    groupMarket,
  } = useTradingService()

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { trackClicked, trackOpened } = useAmplitude()

  const marketAddress = useMemo(() => {
    return market?.marketType === 'group' ? groupMarket?.slug : market?.slug
  }, [market, groupMarket])

  const { data: updatedMarket } = useMarket(marketAddress, !!market)

  useEffect(() => {
    if (updatedMarket) {
      if (updatedMarket.marketType === 'group') {
        setGroupMarket(updatedMarket)
        const updatedMarketInGroup = updatedMarket.markets?.find(
          (updatedM) => market?.id === updatedM.id
        )
        setMarket(updatedMarketInGroup || market)
      } else {
        setMarket(updatedMarket)
      }
      refetchMarkets()
    }
  }, [updatedMarket])

  const tabs = [
    {
      title: 'Resolution',
      icon: <ResolutionIcon width={16} height={16} />,
    },
    {
      title: 'Activity',
      icon: <ActivityIcon width={16} height={16} />,
    },
    {
      title: 'Opinions',
      icon: <OpinionIcon width={16} height={16} />,
    },
  ]

  const tabPanels = useMemo(() => {
    return [
      <MarketPageOverviewTab key={uuidv4()} />,
      <MarketActivityTab key={uuidv4()} isActive={activeActionsTabIndex === 1} />,
      <CommentTab key={uuidv4()} />,
    ]
  }, [activeActionsTabIndex])

  const removeMarketQuery = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('market')
    const newQuery = params.toString()
    router.replace(newQuery ? `${pathname}/?${newQuery}` : pathname, { scroll: false })
  }

  const handleCloseMarketPageClicked = () => {
    setMarket(null)
    removeMarketQuery()
    onCloseMarketPage()
    trackClicked(ClickEvent.CloseMarketClicked, {
      marketAddress: market?.slug as Address,
    })
  }

  useEffect(() => {
    setStrategy('Buy')
  }, [])

  const trackedMarketsRef = useRef(new Set<string>())

  const tradingWidget = useMemo(() => {
    if (!market) {
      return <Skeleton height={isMobile ? 354 : 481} />
    }
    if (market?.expired) {
      return <MarketClosedWidget handleCloseMarketPageClicked={handleCloseMarketPageClicked} />
    }
    return <ClobWidget />
  }, [market])

  const page = usePageName()

  useEffect(() => {
    //avoid triggering amplitude call twice
    if (market?.slug && !trackedMarketsRef.current.has(market.slug)) {
      trackedMarketsRef.current.add(market.slug)
      trackOpened(OpenEvent.SidebarMarketOpened, {
        marketAddress: market.slug,
        marketTags: market.tags,
        marketType: 'single',
        category: market.categories,
        marketMakerType: market.tradeType.toUpperCase(),
        page: page as PageOpenedPage,
      })
    }
  }, [market?.slug])

  useEffect(() => {
    const handleMouseEnter = () => {
      document.body.style.overflow = 'hidden'
    }

    const handleMouseLeave = () => {
      document.body.style.overflow = ''
    }

    const scrollContainer = scrollableBlockRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('mouseenter', handleMouseEnter)
      scrollContainer.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
      }
      document.body.style.overflow = '' // Clean up on unmount
    }
  }, [])

  useEffect(() => {
    setActiveActionsTabIndex(0)
  }, [market])

  return (
    <Box
      bg='var(--chakra-colors-background-97)'
      borderLeft={isMobile ? 'unset' : '1px solid'}
      borderColor='grey.100'
      w={isMobile ? 'full' : '520px'}
      position={isMobile ? 'relative' : 'fixed'}
      height={isMobile ? 'calc(100dvh - 21px)' : 'calc(100vh - 21px)'}
      top='20px'
      right={0}
      overflowY='auto'
      p={isMobile ? '12px' : '16px'}
      pt={isMobile ? 0 : '16px'}
      ref={scrollableBlockRef}
      id='side-menu-scroll-container'
      boxShadow='-4px 0px 8px 0px rgba(0, 0, 0, 0.05)'
      backdropFilter='blur(7.5px)'
      zIndex='200'
    >
      <HStack
        w='full'
        mb='12px'
        justifyContent='space-between'
        mt={isMobile ? 0 : '24px'}
        flexWrap='wrap'
      >
        {market && (
          <MarketCountdown
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
            {...paragraphRegular}
            color='grey.500'
            ended={market.status === MarketStatus.RESOLVED}
          />
        )}
        <HStack gap='6px' flexWrap='wrap'>
          <Text {...paragraphRegular} color='grey.500'>
            Created by
          </Text>
          <ChakraImage
            width={6}
            height={6}
            src={groupMarket?.creator.imageURI ?? '/assets/images/logo.svg'}
            alt='creator'
            borderRadius={'2px'}
          />
          <Link href={groupMarket?.creator.link || ''} variant='textLinkSecondary' fontWeight={400}>
            {groupMarket?.creator.name}
          </Link>
        </HStack>
      </HStack>
      <HStack w='full' justifyContent='space-between' alignItems='flex-start'>
        <Text {...h2Bold}>{market?.title}</Text>
        {isMobile && <ShareMenu />}
      </HStack>
      <Box w='full' mt='24px'>
        <HStack gap='8px' mt={isMobile ? 0 : '8px'} flexWrap='wrap'>
          <HStack gap='12px' w='full' justifyContent='space-between'>
            {groupMarket?.negRiskMarketId && <WinnerTakeAllTooltip />}
            <HStack gap='4px' color='grey.500'>
              <VolumeIcon width={16} height={16} />
              <Text {...paragraphRegular} color='grey.500'>
                Volume
              </Text>
              <Text {...paragraphRegular} color='grey.500'>
                {NumberUtil.convertWithDenomination(market?.volumeFormatted || '0', 6)}{' '}
                {market?.collateralToken.symbol}
              </Text>
            </HStack>
          </HStack>
          {market?.tradeType === 'amm' && (
            <HStack w={isMobile ? 'full' : 'unset'} gap='4px'>
              <UniqueTraders color='grey.50' />
              <Text {...paragraphRegular} color='grey.500'>
                Value
              </Text>
              <Text {...paragraphRegular} color='grey.500'>
                {NumberUtil.convertWithDenomination(
                  market ? +market.openInterestFormatted + +market.liquidityFormatted : 0,
                  6
                )}{' '}
                {market?.collateralToken.symbol}
              </Text>
              <OpenInterestTooltip iconColor='grey.500' />
            </HStack>
          )}
        </HStack>
        <Divider my='24px' />
      </Box>
      {tradingWidget}
      <Box my='24px'>
        <GroupMarketSectionTabs market={market} />
      </Box>
      <Tabs
        position='relative'
        variant='common'
        onChange={(index) => setActiveActionsTabIndex(index)}
        index={activeActionsTabIndex}
      >
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.title}>
              <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                {tab.icon}
                <>{tab.title}</>
              </HStack>
            </Tab>
          ))}
        </TabList>
        <TabIndicator mt='-2px' height='2px' bg='grey.800' transitionDuration='200ms !important' />
        <TabPanels>
          {tabPanels.map((panel, index) => (
            <TabPanel key={index}>{panel}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  )
}
