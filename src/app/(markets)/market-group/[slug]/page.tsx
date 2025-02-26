'use client'

import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Link,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { Image as ChakraImage } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import MobileDrawer from '@/components/common/drawer'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import CommentTab from '@/components/common/markets/comment-tab'
import ShareMenu from '@/components/common/markets/share-menu'
import {
  MarketMetadata,
  MarketTradingForm,
  MarketClosedButton,
} from '@/app/(markets)/markets/[address]/components'
import MarketOverviewTab from '@/app/(markets)/markets/[address]/components/overview-tab'
import { MainLayout } from '@/components'
import useMarketGroup from '@/hooks/use-market-group'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { useWinningIndex } from '@/services/MarketsService'
import { h1Regular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

export default function MarketGroupPage({ params }: { params: { slug: string } }) {
  const { data: marketGroup, isLoading: marketGroupLoading } = useMarketGroup(params.slug)

  const { trackClicked } = useAmplitude()
  const router = useRouter()
  const { market, setMarket, resetQuotes } = useTradingService()
  // const { data: winningIndex } = useWinningIndex(market?.address as string)

  // const resolved = winningIndex === 0 || winningIndex === 1

  const isCollateralLoading = false

  const handleBackClicked = () => {
    if (window.history.length > 2) {
      return router.back()
    }
    return router.push('/')
  }

  const marketActionForm = useMemo(() => {
    // if (market) {
    //   return market.expired ? (
    //     <MarketClaimingForm market={market} />
    //   ) : (
    //     <MarketTradingForm
    //       market={market}
    //       setSelectedMarket={setMarket}
    //       marketGroup={marketGroup}
    //     />
    //   )
    // }
    return null
  }, [market, marketGroup])

  const mobileTradeButton = useMemo(() => {
    return market?.expired ? (
      <MarketClosedButton />
    ) : (
      <MobileDrawer
        trigger={
          <Button
            variant='contained'
            w='full'
            h='48px'
            mt='32px'
            color='white'
            onClick={() => {
              trackClicked(ClickEvent.TradeButtonClicked, {
                platform: 'mobile',
                address: market?.slug,
              })
            }}
          >
            Trade
          </Button>
        }
        title={`${marketGroup?.title}: ${market?.title}`}
        variant='blue'
      >
        <MarketTradingForm
          market={market as Market}
          setSelectedMarket={setMarket}
          marketGroup={marketGroup}
        />
      </MobileDrawer>
    )
  }, [market])

  const tabs = [
    {
      title: 'Overview',
      icon: <PredictionsIcon width={16} height={16} />,
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

  // const tabPanels = useMemo(() => {
  //   return [
  //     <MarketOverviewTab market={market as Market} key={uuidv4()} marketGroup={marketGroup} />,
  //     <MarketActivityTab key={uuidv4()} isActive />,
  //     <CommentTab key={uuidv4()} />,
  //   ]
  // }, [market, winningIndex, resolved, marketGroup])

  useEffect(() => {
    if (marketGroup) {
      setMarket(marketGroup.markets[0])
    }
  }, [marketGroup])

  useEffect(() => {
    resetQuotes()
  }, [])

  return (
    <MainLayout isLoading={isCollateralLoading || marketGroupLoading || !market}>
      {!marketGroup ? (
        <>Market group not found</>
      ) : (
        <>
          <HStack
            gap='40px'
            w={isMobile ? 'full' : 'unset'}
            alignItems='flex-start'
            mb={isMobile ? '84px' : 0}
          >
            <Box w={isMobile ? 'full' : '664px'}>
              <Divider orientation='horizontal' h='3px' />
              <HStack justifyContent='space-between' mt='10px' mb='24px'>
                <Button
                  variant='grey'
                  onClick={() => {
                    trackClicked(ClickEvent.BackClicked, {
                      address: market?.slug || '0x',
                    })
                    handleBackClicked()
                  }}
                >
                  <ArrowLeftIcon width={16} height={16} />
                  Back
                </Button>
                <ShareMenu />
              </HStack>
              <Box>
                <Heading {...h1Regular} userSelect='text'>
                  {marketGroup?.title}
                </Heading>
              </Box>
              <HStack gap={isMobile ? '4px' : '16px'} mt='16px' mb='24px'>
                <HStack gap='8px' flexWrap='wrap'>
                  <ChakraImage
                    width={6}
                    height={6}
                    src={marketGroup?.creator.imageURI ?? '/assets/images/logo.svg'}
                    alt='creator'
                    borderRadius={'2px'}
                  />
                  <Link href={marketGroup?.creator.link} _hover={{ borderColor: 'unset' }}>
                    <Text color='grey.500'>{marketGroup?.creator.name}</Text>
                  </Link>
                  {market?.tags?.map((tag) => (
                    <Text color='grey.500' key={tag}>
                      #{tag}
                    </Text>
                  ))}
                </HStack>
              </HStack>
              {/*<MarketMetadata*/}
              {/*  market={market ? market : undefined}*/}
              {/*  winningIndex={winningIndex}*/}
              {/*  resolved={resolved}*/}
              {/*  marketLoading={marketGroupLoading}*/}
              {/*/>*/}
              <Box mt={isMobile ? '48px' : '24px'} />
              <Tabs position='relative' variant='common'>
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
                <TabIndicator
                  mt='-2px'
                  height='2px'
                  bg='grey.800'
                  transitionDuration='200ms !important'
                />
                {/*<TabPanels>*/}
                {/*  {tabPanels.map((panel, index) => (*/}
                {/*    <TabPanel key={index}>{panel}</TabPanel>*/}
                {/*  ))}*/}
                {/*</TabPanels>*/}
              </Tabs>
            </Box>
            {!isMobile && marketActionForm}
          </HStack>
          {isMobile && (
            <Box position='fixed' bottom='86px' w='calc(100% - 32px)'>
              {mobileTradeButton}
            </Box>
          )}
        </>
      )}
    </MainLayout>
  )
}
