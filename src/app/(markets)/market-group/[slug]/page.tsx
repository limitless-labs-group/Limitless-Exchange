'use client'

import {
  Box,
  Button,
  Divider,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { Image as ChakraImage } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import MobileDrawer from '@/components/common/drawer'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import TextWithPixels from '@/components/common/text-with-pixels'
import {
  MarketClaimingForm,
  MarketMetadata,
  MarketTradingForm,
  MobileTradeButton,
} from '@/app/(markets)/markets/[address]/components'
import MarketOverviewTab from '@/app/(markets)/markets/[address]/components/overview-tab'
import { MainLayout } from '@/components'
import useMarketGroup from '@/hooks/use-market-group'
import WarpcastIcon from '@/resources/icons/Farcaster.svg'
import TwitterIcon from '@/resources/icons/X.svg'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import ShareIcon from '@/resources/icons/share-icon.svg'
import {
  ClickEvent,
  createMarketShareUrls,
  ShareClickedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useWinningIndex } from '@/services/MarketsService'
import { h1Regular, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

export default function MarketGroupPage({ params }: { params: { slug: string } }) {
  const { data: marketGroup, isLoading: marketGroupLoading } = useMarketGroup(params.slug)

  const { trackClicked } = useAmplitude()
  const router = useRouter()
  const { market, setMarket, resetQuotes } = useTradingService()
  const [isShareMenuOpen, setShareMenuOpen] = useState(false)

  const { tweetURI, castURI } = createMarketShareUrls(
    market,
    market?.prices,
    marketGroup?.creator.name
  )
  const { data: winningIndex } = useWinningIndex(market?.address as string)

  const resolved = winningIndex === 0 || winningIndex === 1

  const isCollateralLoading = false

  const handleBackClicked = () => {
    if (window.history.length > 2) {
      return router.back()
    }
    return router.push('/')
  }

  const volume =
    marketGroup?.markets.reduce((a, b) => {
      return new BigNumber(a).plus(new BigNumber(b.volumeFormatted)).toString()
    }, '0') || '0'

  const liquidity =
    marketGroup?.markets.reduce((a, b) => {
      return new BigNumber(a).plus(new BigNumber(b.liquidityFormatted)).toString()
    }, '0') || '0'

  const marketActionForm = useMemo(() => {
    if (market) {
      return market.expired ? (
        <MarketClaimingForm market={market} />
      ) : (
        <MarketTradingForm
          market={market}
          setSelectedMarket={setMarket}
          marketGroup={marketGroup}
        />
      )
    }
    return null
  }, [market, marketGroup])

  const mobileTradeButton = useMemo(() => {
    return market?.expired ? (
      <MobileTradeButton market={market} />
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
                address: market?.address,
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
  ]

  const tabPanels = useMemo(() => {
    return [
      <MarketOverviewTab market={market as Market} key={uuidv4()} marketGroup={marketGroup} />,
      <MarketActivityTab key={uuidv4()} />,
    ]
  }, [market, winningIndex, resolved, marketGroup])

  const parseTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Link key={index} href={part} color='teal.500' isExternal>
            {part}
          </Link>
        )
      }
      return part
    })
  }

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
          <HStack gap='40px' alignItems='flex-start' mb={isMobile ? '84px' : 0}>
            <Box w={isMobile ? 'full' : '664px'}>
              <Divider bg='grey.800' orientation='horizontal' h='3px' />
              <HStack justifyContent='space-between' mt='10px' mb='24px'>
                <Button
                  variant='grey'
                  onClick={() => {
                    trackClicked(ClickEvent.BackClicked, {
                      address: market?.address || '0x',
                    })
                    handleBackClicked()
                  }}
                >
                  <ArrowLeftIcon width={16} height={16} />
                  Back
                </Button>
                <Menu isOpen={isShareMenuOpen} onClose={() => setShareMenuOpen(false)}>
                  <MenuButton
                    onClick={() => {
                      trackClicked(ClickEvent.ShareMenuClicked, {
                        address: market?.address || '0x',
                        marketType: 'group',
                      })
                      setShareMenuOpen(true)
                    }}
                  >
                    <HStack gap='4px'>
                      <ShareIcon width={16} height={16} />
                      <Text {...paragraphMedium}>Share</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList borderRadius='2px' w={isMobile ? '160px' : '122px'} zIndex={2}>
                    <MenuItem
                      onClick={() => {
                        trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
                          type: 'Farcaster',
                          address: market?.address,
                          marketType: 'group',
                        })
                        window.open(castURI, '_blank', 'noopener')
                      }}
                    >
                      <HStack gap='4px'>
                        <WarpcastIcon />
                        <Text {...paragraphMedium}>On Warpcast</Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
                          type: 'X/Twitter',
                          address: market?.address,
                          marketType: 'group',
                        })
                        window.open(tweetURI, '_blank', 'noopener')
                      }}
                    >
                      <HStack gap='4px'>
                        <TwitterIcon />
                        <Text {...paragraphMedium}>On X</Text>
                      </HStack>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
              <Box>
                <TextWithPixels
                  text={marketGroup?.title || ''}
                  {...(isMobile ? { ...h1Regular } : {})}
                  fontSize='32px'
                  userSelect='text'
                />
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
              <MarketMetadata
                market={market}
                winningIndex={winningIndex}
                resolved={resolved}
                outcomeTokensPercent={market?.prices}
                volume={volume}
                liquidity={liquidity}
              />
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
                <TabPanels>
                  {tabPanels.map((panel, index) => (
                    <TabPanel key={index}>{panel}</TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </Box>
            {!isMobile && marketActionForm}
          </HStack>
          {isMobile && (
            <Box position='fixed' bottom='76px' w='calc(100% - 32px)'>
              {mobileTradeButton}
            </Box>
          )}
        </>
      )}
    </MainLayout>
  )
}
