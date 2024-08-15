'use client'

import { MainLayout } from '@/components'
import {
  Box,
  Divider,
  HStack,
  Text,
  Button,
  Image as ChakraImage,
  useDisclosure,
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
  useLimitlessApi,
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
  MarketTradingModal,
  MobileTradeButton,
} from './components'
import {
  h1Regular,
  paragraphBold,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { Address } from 'viem'

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
    approveSell,
  } = useTradingService()
  const {
    isOpen: tradeModalOpened,
    onOpen: openTradeModal,
    onClose: closeTradeModal,
  } = useDisclosure()

  const marketActionForm = useMemo(() => {
    if (market) {
      return market.expired ? (
        <MarketClaimingForm market={market} />
      ) : (
        <MarketTradingForm market={market} outcomeTokensPercent={market.prices} />
      )
    }
    return null
  }, [market, market?.prices])

  const handleApproveMarket = async () => {
    return strategy === 'Buy' ? approveBuy() : approveSell()
  }

  const mobileTradeButton = useMemo(() => {
    return market?.expired ? (
      <MobileTradeButton market={market} />
    ) : (
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
          openTradeModal()
        }}
      >
        Trade
      </Button>
    )
  }, [market])

  const handleBackClicked = () => {
    if (window.history.length > 2) {
      return router.back()
    }
    return router.push('/')
  }

  useEffect(() => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Market Page',
      market: params.address,
    })
  }, [])

  useEffect(() => {
    if (market != previousMarket && !fetchMarketError) {
      setMarket(market!)
    }
  }, [market, previousMarket])

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
                {market?.description}
              </Text>
            </Box>
            {!isMobile && marketActionForm}
          </HStack>
          {isMobile && (
            <Box position='fixed' bottom='12px' w='calc(100% - 32px)'>
              {mobileTradeButton}
            </Box>
          )}
          {isMobile && market && (
            <MarketTradingModal
              open={tradeModalOpened}
              onClose={closeTradeModal}
              title={(market?.proxyTitle ?? market?.title) || ''}
              market={market}
              outcomeTokensPercent={market.prices}
            />
          )}
          <ApproveModal onApprove={handleApproveMarket} />
        </>
      )}
    </MainLayout>
  )
}

export default MarketPage
