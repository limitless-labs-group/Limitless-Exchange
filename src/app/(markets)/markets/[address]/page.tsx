'use client'

import { MainLayout } from '@/components'
import {
  Box,
  Divider,
  HStack,
  Text,
  Button,
  Image as ChakraImage,
  MenuButton,
  Menu,
  MenuItem,
  MenuList,
  Link,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import {
  ClickEvent,
  createMarketShareUrls,
  OpenEvent,
  PageOpenedMetadata,
  ShareClickedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useMarket, useWinningIndex } from '@/services/MarketsService'
import ApproveModal from '@/components/common/modals/approve-modal'
import { useToken } from '@/hooks/use-token'
import { defaultChain } from '@/constants'
import { useRouter } from 'next/navigation'
import TextWithPixels from '@/components/common/text-with-pixels'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import ShareIcon from '@/resources/icons/share-icon.svg'
import DescriptionIcon from '@/resources/icons/description-icon.svg'
import { isMobile } from 'react-device-detect'
import WarpcastIcon from '@/resources/icons/Farcaster.svg'
import TwitterIcon from '@/resources/icons/X.svg'
import {
  MarketClaimingForm,
  MarketMetadata,
  MarketPositions,
  MarketPriceChart,
  MarketTradingForm,
  MobileTradeButton,
} from './components'
import {
  h1Regular,
  paragraphBold,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { Address, zeroAddress } from 'viem'
import MobileDrawer from '@/components/common/drawer'
import { Market } from '@/types'

const MarketPage = ({ params }: { params: { address: Address } }) => {
  const [isShareMenuOpen, setShareMenuOpen] = useState(false)
  /**
   * ANALYTICS
   */
  const { trackOpened, trackClicked } = useAmplitude()
  const { data: winningIndex } = useWinningIndex(params.address)
  const resolved = winningIndex === 0 || winningIndex === 1
  const router = useRouter()
  const {
    data: market,
    isError: fetchMarketError,
    isLoading: fetchMarketLoading,
  } = useMarket(params.address)
  const { tweetURI, castURI } = createMarketShareUrls(market, market?.prices, market?.creator.name)
  const { isLoading: isCollateralLoading } = useToken(market?.collateralToken.address)
  const {
    setMarket,
    market: previousMarket,
    approveBuy,
    strategy,
    resetQuotes,
  } = useTradingService()

  const marketActionForm = useMemo(() => {
    if (market) {
      return market.expired ? (
        <MarketClaimingForm market={market} />
      ) : (
        <MarketTradingForm market={market} outcomeTokensPercent={market.prices} />
      )
    }
    return null
  }, [market])

  const handleApproveMarket = async () => {
    await approveBuy()
  }

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
        title={market?.title || ''}
        variant='blue'
      >
        <MarketTradingForm market={market as Market} outcomeTokensPercent={market?.prices} />
      </MobileDrawer>
    )
  }, [market])

  const handleBackClicked = () => {
    if (window.history.length > 2) {
      return router.back()
    }
    return router.push('/')
  }

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
    if (market != previousMarket && !fetchMarketError) {
      setMarket(market!)
    }
  }, [market, previousMarket])

  useEffect(() => {
    resetQuotes()
  }, [])

  return (
    <MainLayout isLoading={isCollateralLoading || fetchMarketLoading}>
      {!market ? (
        <>Market not found</>
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
                      address: market?.address,
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
                        address: market?.address,
                        marketType: 'single',
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
                          marketType: 'single',
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
                          marketType: 'single',
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
                  text={(market?.proxyTitle ?? market?.title) || ''}
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
                    src={market?.creator.imageURI ?? '/assets/images/logo.svg'}
                    alt='creator'
                    borderRadius={'2px'}
                  />
                  <Link href={market?.creator.link}>
                    <Text color='grey.500'>{market?.creator.name}</Text>
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
                outcomeTokensPercent={market.prices}
                liquidity={market.liquidityFormatted}
                volume={market.volumeFormatted}
              />
              <MarketPriceChart
                marketAddr={market.address[defaultChain.id] ?? zeroAddress}
                winningIndex={winningIndex}
                resolved={resolved}
                outcomeTokensPercent={market.prices}
              />
              <MarketPositions market={market} />
              <HStack gap='4px' marginTop='24px' mb='8px'>
                <DescriptionIcon width='16px' height='16px' />
                <Text {...paragraphBold}>Description</Text>
              </HStack>
              <Text {...paragraphRegular} userSelect='text'>
                {parseTextWithLinks(market?.description)}
              </Text>
            </Box>
            {!isMobile && marketActionForm}
          </HStack>
          {isMobile && (
            <Box position='fixed' bottom='76px' w='calc(100% - 32px)'>
              {mobileTradeButton}
            </Box>
          )}
          <ApproveModal onApprove={handleApproveMarket} />
        </>
      )}
    </MainLayout>
  )
}

export default MarketPage
