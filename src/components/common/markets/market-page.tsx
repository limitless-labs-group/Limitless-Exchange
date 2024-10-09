import Paper from '@/components/common/paper'
import {
  Button,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Image as ChakraImage,
  Box,
  Divider,
  VStack,
} from '@chakra-ui/react'
import {
  ChangeEvent,
  createMarketShareUrls,
  StrategyChangedMetadata,
  useAmplitude,
  useHistory,
  useTradingService,
} from '@/services'
import CloseIcon from '@/resources/icons/close-icon.svg'
import ShareIcon from '@/resources/icons/share-icon.svg'
import { controlsMedium, h1Regular, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { isMobile } from 'react-device-detect'
import WarpcastIcon from '@/resources/icons/Farcaster.svg'
import TwitterIcon from '@/resources/icons/X.svg'
import React, { useMemo, useState } from 'react'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { NumberUtil } from '@/utils'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { Address, zeroAddress } from 'viem'
import MarketPageBuyForm from '@/components/common/markets/market-page-buy-form'
import { defaultChain } from '@/constants'
import { MarketPriceChart } from '@/app/(markets)/markets/[address]/components'
import { useWinningIndex } from '@/services/MarketsService'

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}

export default function MarketPage() {
  const [isShareMenuOpen, setShareMenuOpen] = useState(false)
  const { setMarket, setMarketPageOpened, market, strategy, setStrategy } = useTradingService()

  const { trackChanged } = useAmplitude()
  const { positions: allMarketsPositions } = useHistory()
  const { data: winningIndex } = useWinningIndex(market?.address || '')
  const resolved = winningIndex === 0 || winningIndex === 1
  // Todo change creator name
  const { tweetURI, castURI } = createMarketShareUrls(market, market?.prices, 'asd')

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) => position.market.id.toLowerCase() === market?.address.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  return (
    <Paper
      bg='grey.50'
      borderTopLeftRadius='8px'
      borderBottomLeftRadius='8px'
      borderTopRadius={0}
      borderBottomRightRadius={0}
      w='488px'
      position='fixed'
      top='21px'
      right={0}
      overflowY='auto'
    >
      <HStack w='full' justifyContent='space-between'>
        <Button
          variant='grey'
          onClick={() => {
            setMarket(null)
            setMarketPageOpened(false)
            // trackClicked(ClickEvent.BackClicked, {
            //   address: market?.address,
            // })
            // handleBackClicked()
          }}
        >
          <CloseIcon width={16} height={16} />
          Close
        </Button>
        <Menu isOpen={isShareMenuOpen} onClose={() => setShareMenuOpen(false)}>
          <MenuButton
            onClick={() => {
              // trackClicked(ClickEvent.ShareMenuClicked, {
              //   address: market?.address,
              //   marketType: 'single',
              // })
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
                // trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
                //   type: 'Farcaster',
                //   address: market?.address,
                //   marketType: 'single',
                // })
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
                // trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
                //   type: 'X/Twitter',
                //   address: market?.address,
                //   marketType: 'single',
                // })
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
      <Text mt='10px' {...h1Regular}>
        {market?.title}
      </Text>
      <HStack w='full' justifyContent='space-between' mt='10px' mb='4px'>
        <HStack gap='24px'>
          <HStack gap='4px' color='grey.500'>
            <CalendarIcon width={16} height={16} />
            {market?.expirationTimestamp &&
            market.expirationTimestamp - new Date().getTime() < 1000 * 24 * 60 * 60 ? (
              <DailyMarketTimer
                deadline={`${new Date(market.expirationTimestamp)}`}
                color='grey.500'
              />
            ) : (
              <Text {...paragraphMedium} color='grey.500'>
                {market?.expirationDate}
              </Text>
            )}
          </HStack>
          <HStack gap='8px' flexWrap='wrap'>
            <ChakraImage
              width={6}
              height={6}
              src={'/assets/images/logo.svg'}
              alt='creator'
              borderRadius={'2px'}
            />
            <Link href={''}>
              <Text color='grey.500'>Creator name</Text>
            </Link>
          </HStack>
        </HStack>
        <HStack gap={1} color={defaultColors.main}>
          <Text {...paragraphMedium} color={defaultColors.main}>
            {market?.prices[0]}%
          </Text>
          <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
            <Box
              h='100%'
              w='100%'
              borderRadius='100%'
              bg={`conic-gradient(${defaultColors.main} ${market?.prices[0]}% 10%, ${defaultColors.chartBg} ${market?.prices[0]}% 100%)`}
            />
          </Box>
        </HStack>
      </HStack>
      <Divider my='8px' color='grey.300' />
      <HStack w='full' mb='24px'>
        <VStack alignItems='center' flex={1} gap={0}>
          <HStack color='grey.400' gap='4px'>
            <VolumeIcon width={16} height={16} />
            <Text {...paragraphMedium} color='grey.400'>
              Volume
            </Text>
          </HStack>
          <Text {...paragraphMedium} color='grey.500'>{`${NumberUtil.convertWithDenomination(
            market?.volumeFormatted,
            6
          )} ${market?.collateralToken.symbol}`}</Text>
        </VStack>
        <VStack alignItems='center' flex={1} gap={0}>
          <HStack color='grey.400' gap='4px'>
            <LiquidityIcon width={16} height={16} />
            <Text {...paragraphMedium} color='grey.400'>
              Liquidity
            </Text>
          </HStack>
          <Text {...paragraphMedium} color='grey.500'>{`${NumberUtil.convertWithDenomination(
            market?.liquidityFormatted,
            6
          )} ${market?.collateralToken.symbol}`}</Text>
        </VStack>
      </HStack>
      <Paper bg='blue.500' borderRadius='8px' overflowX='hidden'>
        <HStack
          w={'240px'}
          mx='auto'
          bg='rgba(255, 255, 255, 0.20)'
          borderRadius='2px'
          py='2px'
          px={isMobile ? '4px' : '2px'}
          mb={isMobile ? '32px' : '24px'}
        >
          <Button
            h={isMobile ? '28px' : '20px'}
            flex='1'
            py='2px'
            borderRadius='2px'
            bg={strategy === 'Buy' ? 'white' : 'unset'}
            color={strategy === 'Buy' ? 'black' : 'white'}
            _hover={{
              backgroundColor: strategy === 'Buy' ? 'white' : 'rgba(255, 255, 255, 0.30)',
            }}
            onClick={() => {
              trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
                type: 'Buy selected',
                marketAddress: market?.address as Address,
              })
              setStrategy('Buy')
            }}
          >
            <Text {...controlsMedium} color={strategy == 'Buy' ? 'font' : 'fontLight'}>
              Buy
            </Text>
          </Button>
          <Button
            h={isMobile ? '28px' : '20px'}
            flex='1'
            borderRadius='2px'
            py='2px'
            bg={strategy === 'Sell' ? 'white' : 'unset'}
            color={strategy === 'Sell' ? 'black' : 'white'}
            _hover={{
              backgroundColor: strategy === 'Sell' ? 'white' : 'rgba(255, 255, 255, 0.30)',
            }}
            _disabled={{
              opacity: '50%',
              pointerEvents: 'none',
            }}
            onClick={() => {
              trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
                type: 'Sell selected',
                marketAddress: market?.address as Address,
              })
              setStrategy('Sell')
            }}
            isDisabled={!positions?.length}
          >
            <Text {...controlsMedium} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
              Sell
            </Text>
          </Button>
        </HStack>
        {strategy === 'Buy' && <MarketPageBuyForm />}
      </Paper>
      {market && (
        <MarketPriceChart
          marketAddr={market.address[defaultChain.id] ?? zeroAddress}
          winningIndex={winningIndex}
          resolved={resolved}
          outcomeTokensPercent={market.prices}
        />
      )}
    </Paper>
  )
}
