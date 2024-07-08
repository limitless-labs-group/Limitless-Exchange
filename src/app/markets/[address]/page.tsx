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
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import {
  createMarketShareUrls,
  OpenEvent,
  PageOpenedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useMarket } from '@/services/MarketsService'
import ApproveModal from '@/components/common/modals/approve-modal'
import { useToken } from '@/hooks/use-token'
import { defaultChain } from '@/constants'
import { useRouter } from 'next/navigation'
import TextWithPixels from '@/components/common/text-with-pixels'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import ShareIcon from '@/resources/icons/share-icon.svg'
import DescriptionIcon from '@/resources/icons/description-icon.svg'
import { isMobile } from 'react-device-detect'
import WarpcastIcon from '@/resources/icons/warpcast-icon.svg'
import { FaXTwitter } from 'react-icons/fa6'
import {
  MarketClaimingForm,
  MarketMetadata,
  MarketPositions,
  MarketPriceChart,
  MarketTradingForm,
  MarketTradingModal,
} from './components'

const MarketPage = ({ params }: { params: { address: string } }) => {
  const [isShareMenuOpen, setShareMenuOpen] = useState(false)
  /**
   * ANALYTICS
   */
  const { trackOpened } = useAmplitude()
  const router = useRouter()
  const market = useMarket(params.address)
  const { tweetURI, castURI } = createMarketShareUrls(market, market?.prices)

  const {
    isOpen: tradeModalOpened,
    onOpen: openTradeModal,
    onClose: closeTradeModal,
  } = useDisclosure()

  useEffect(() => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Market Page',
      market: params.address,
    })
  }, [])

  const { isLoading: isCollateralLoading } = useToken(market?.collateralToken[defaultChain.id])

  const {
    setMarket,
    market: previousMarket,
    approveBuy,
    strategy,
    approveSell,
  } = useTradingService()

  useEffect(() => {
    if (market != previousMarket) {
      setMarket(market)
    }
  }, [market, previousMarket])

  const handleApproveMarket = async () => {
    return strategy === 'Buy' ? approveBuy() : approveSell()
  }

  const marketActionForm = useMemo(() => {
    if (market) {
      return market.expired ? (
        <MarketClaimingForm market={market} />
      ) : (
        <MarketTradingForm market={market} />
      )
    }
    return null
  }, [market])

  return (
    <MainLayout maxContentWidth={'1200px'} isLoading={!market || isCollateralLoading}>
      <HStack gap='40px' alignItems='flex-start'>
        <Box w={isMobile ? 'full' : '664px'}>
          <Divider bg='black' orientation='horizontal' h='3px' />
          <HStack justifyContent='space-between' mt='10px' mb='24px'>
            <Button variant='grey' onClick={() => router.back()}>
              <ArrowLeftIcon width={16} height={16} />
              Back
            </Button>
            <Menu isOpen={isShareMenuOpen} onClose={() => setShareMenuOpen(false)}>
              <MenuButton
                py='4px'
                px='8px'
                borderRadius='2px'
                bg='grey.300'
                onClick={() => setShareMenuOpen(true)}
              >
                <HStack gap='4px'>
                  <ShareIcon width={16} height={16} />
                  <Text fontWeight={500}>Share</Text>
                </HStack>
              </MenuButton>
              <MenuList borderRadius='2px' w='full'>
                <MenuItem
                  onClick={() => window.open(castURI, '_blank', 'noopener')}
                  _focus={{ bg: 'grey.200' }}
                  _hover={{ bg: 'grey.200' }}
                >
                  <HStack gap='4px'>
                    <WarpcastIcon />
                    <Text fontWeight={500}>Warpcast</Text>
                  </HStack>
                </MenuItem>
                <MenuItem
                  onClick={() => window.open(tweetURI, '_blank', 'noopener')}
                  _hover={{ bg: 'grey.200' }}
                >
                  <HStack gap='4px'>
                    <FaXTwitter size={'16px'} />
                    <Text fontWeight={500}>X</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
          <Box>
            <TextWithPixels text={market?.title || ''} fontSize={'32px'} />
          </Box>
          <HStack
            gap={isMobile ? '4px' : '16px'}
            mt='16px'
            mb='24px'
            flexDir={isMobile ? 'column' : 'row'}
            alignItems={isMobile ? 'flex-start' : 'center'}
          >
            <HStack gap='8px'>
              <ChakraImage
                width={6}
                height={6}
                src={market?.creator.imageURI ?? '/assets/images/logo.svg'}
                alt='creator'
                borderRadius={'2px'}
              />
              <Text color='grey.500'>{market?.creator.name}</Text>
            </HStack>
            <HStack gap='8px'>
              {market?.tags?.map((tag) => (
                <Text color='grey.500' key={tag}>
                  #{tag}
                </Text>
              ))}
            </HStack>
          </HStack>
          <MarketMetadata market={market} />
          <MarketPriceChart market={market} />
          <MarketPositions market={market} />
          <HStack gap='4px' marginTop='24px' mb='8px'>
            <DescriptionIcon width='16px' height='16px' />
            <Text fontWeight={700}>Description</Text>
          </HStack>
          <Text>{market?.description}</Text>
        </Box>
        {!isMobile && marketActionForm}
      </HStack>
      {isMobile && (
        <Button variant='contained' w='full' mt='32px' onClick={openTradeModal}>
          Trade
        </Button>
      )}
      {isMobile && market && (
        <MarketTradingModal
          open={tradeModalOpened}
          onClose={closeTradeModal}
          title={market?.title || ''}
          market={market}
        />
      )}
      <ApproveModal onApprove={handleApproveMarket} />
    </MainLayout>
  )
}

export default MarketPage
