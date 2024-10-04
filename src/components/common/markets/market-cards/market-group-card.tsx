import { MarketGroupCardResponse } from '@/types'
import Paper from '@/components/common/paper'
import { Box, Button, Divider, HStack, Text, useOutsideClick, VStack } from '@chakra-ui/react'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { isMobile } from 'react-device-detect'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import NextLink from 'next/link'
import React, {
  LegacyRef,
  MutableRefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ClickEvent,
  OpenEvent,
  PageOpenedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useRouter, useSearchParams } from 'next/navigation'
import { dailyMarketToMarket } from '@/utils/market'
import { MarketTradingForm } from '@/app/(markets)/markets/[address]/components'
import { Address } from 'viem'
import MobileDrawer from '@/components/common/drawer'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'

interface MarketGroupCardProps {
  marketGroup: MarketGroupCardResponse
  position: number
  positionFromBottom: number
}

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
  divider: 'var(--chakra-colors-grey-400)',
}

const hoverColors = {
  main: 'var(--chakra-colors-white)',
  secondary: 'var(--chakra-colors-transparent-700)',
  chartBg: 'var(--chakra-colors-transparent-300)',
  divider: 'var(--chakra-colors-transparent-300)',
}

export const MarketGroupCard = ({
  marketGroup,
  position,
  positionFromBottom,
}: MarketGroupCardProps) => {
  const router = useRouter()
  const ref = useRef<HTMLElement>()
  const [colors, setColors] = useState(defaultColors)
  const [tradingWidgetOpened, setTradingWidgetOpened] = useState(false)
  const [showQuickBetButton, setShowQuickBetButton] = useState(false)

  const searchParams = useSearchParams()
  const { trackClicked, trackOpened } = useAmplitude()
  const { setMarket, market: selectedMarket } = useTradingService()
  const category = searchParams.get('category')

  const totalLiquidity = marketGroup.markets.reduce((a, b) => {
    return +a + +b.liquidityFormatted
  }, 0)

  const totalVolume = marketGroup.markets.reduce((a, b) => {
    return +a + +b.volumeFormatted
  }, 0)

  const preparedMarketGroup = {
    ...marketGroup,
    markets: marketGroup.markets.map((market) => {
      return {
        ...market,
        collateralToken: {
          ...marketGroup.collateralToken,
        },
      }
    }),
  }

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => {
      setTradingWidgetOpened(false)
    },
  })

  const trackMarketClicked = () => {
    trackClicked(ClickEvent.MarketPageOpened, {
      bannerPosition: position,
      bannerPaginationPage: 1,
      platform: isMobile ? 'mobile' : 'desktop',
      bannerType: 'Standard banner',
      source: 'Explore Market',
      marketCategory: category,
      marketAddress: marketGroup.slug,
      marketType: 'group',
      page: 'Market Page',
    })
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Market Page',
      market: marketGroup.slug,
      marketType: 'group',
    })
  }

  const handleQuickBuyClicked = (e: SyntheticEvent) => {
    setMarket(
      dailyMarketToMarket(
        preparedMarketGroup.markets[0],
        preparedMarketGroup.collateralToken.address as Address
      )
    )
    trackMarketClicked()
  }

  const onClickQuickBuy = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTradingWidgetOpened(true)
    setColors(hoverColors)
    setMarket(
      dailyMarketToMarket(
        preparedMarketGroup.markets[0],
        preparedMarketGroup.collateralToken.address as Address
      )
    )
    trackClicked(ClickEvent.QuickBetClicked, {
      bannerPosition: position,
      platform: isMobile ? 'mobile' : 'desktop',
      bannerType: 'Standard card',
      marketCategory: category,
      marketGroup: marketGroup.title,
      marketType: 'group',
      source: 'Explore Market',
    })
  }

  useEffect(() => {
    if (!tradingWidgetOpened) {
      setShowQuickBetButton(false)
      setColors(defaultColors)
      setMarket(null)
    }
  }, [tradingWidgetOpened])

  const content = (
    <Paper
      w={'full'}
      justifyContent={'space-between'}
      cursor='pointer'
      position='relative'
      _hover={{ ...(!isMobile ? { bg: 'blue.500' } : {}) }}
      bg={tradingWidgetOpened ? 'blue.500' : 'grey.200'}
      onMouseEnter={() => {
        if (!isMobile) {
          // setShowQuickBetButton(true)
          setColors(hoverColors)
        }
      }}
      onMouseLeave={() => {
        if (!isMobile && !tradingWidgetOpened) {
          setColors(defaultColors)
          // setShowQuickBetButton(false)
        }
      }}
      onClick={trackMarketClicked}
    >
      {showQuickBetButton && (
        <Button
          variant='black'
          position='absolute'
          transform='rotate(-15deg)'
          top='16px'
          onClick={onClickQuickBuy}
        >
          Quick buy
        </Button>
      )}
      <HStack justifyContent='space-between' mb='12px'>
        <Text {...paragraphMedium} color={colors.main} lineHeight={'20px'}>
          {marketGroup.title ?? 'Noname market'}
        </Text>
      </HStack>
      <HStack
        gap={isMobile ? '8px' : '16px'}
        mt={isMobile ? '16px' : '8px'}
        flexDirection={isMobile ? 'column' : 'row'}
      >
        <HStack
          w={isMobile ? '100%' : 'unset'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
        >
          <HStack color={colors.secondary} gap='4px'>
            <LiquidityIcon width={16} height={16} />
            <Text {...paragraphMedium} color={colors.secondary}>
              Liquidity
            </Text>
          </HStack>
          <Text {...paragraphRegular} color={colors.main}>
            {NumberUtil.formatThousands(totalLiquidity, 6)} {marketGroup.collateralToken.symbol}
          </Text>
        </HStack>
        <HStack
          w={isMobile ? '100%' : 'unset'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
        >
          <HStack color={colors.secondary} gap='4px'>
            <VolumeIcon width={16} height={16} />
            <Text {...paragraphMedium} color={colors.secondary}>
              Volume
            </Text>
          </HStack>
          <Text {...paragraphRegular} color={colors.main}>
            {NumberUtil.formatThousands(totalVolume, 6)} {marketGroup.collateralToken.symbol}
          </Text>
        </HStack>
      </HStack>
      <Box my='8px'>
        <Divider color={colors.divider} />
      </Box>
      <VStack gap={isMobile ? '8px' : '4px'} alignItems='start'>
        {marketGroup.markets.slice(0, 3).map((market) => (
          <HStack justifyContent='space-between' key={market.address} w='full'>
            <Text {...paragraphMedium} color={colors.main}>
              {market.title}
            </Text>
            <HStack gap={1} color={colors.main}>
              <Text {...paragraphMedium} color={colors.main}>
                {market.prices[0]}%
              </Text>
              <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
                <Box
                  h='100%'
                  w='100%'
                  borderRadius='100%'
                  bg={`conic-gradient(${colors.main} ${market.prices[0]}% 10%, ${colors.chartBg} ${market.prices[0]}% 100%)`}
                />
              </Box>
            </HStack>
          </HStack>
        ))}
        {marketGroup.markets.length > 3 && (
          <Text {...paragraphMedium} color={colors.secondary}>
            +{marketGroup.markets.length - 3} more
          </Text>
        )}
      </VStack>
      {/*{isMobile && (*/}
      {/*  <>*/}
      {/*    <Divider bg='grey.800' opacity='0.2 !important' mt='16px' mb='8px' />*/}
      {/*    <HStack w='full' justifyContent='space-between'>*/}
      {/*      <MobileDrawer*/}
      {/*        trigger={*/}
      {/*          <Button variant='dashed' onClick={handleQuickBuyClicked}>*/}
      {/*            Quick buy*/}
      {/*          </Button>*/}
      {/*        }*/}
      {/*        variant='blue'*/}
      {/*        title={marketGroup.title}*/}
      {/*      >*/}
      {/*        {selectedMarket && (*/}
      {/*          <MarketTradingForm*/}
      {/*            market={selectedMarket}*/}
      {/*            analyticParams={{ quickBetSource: 'Standard banner', source: 'Quick Bet' }}*/}
      {/*            showTitle={true}*/}
      {/*            setSelectedMarket={setMarket}*/}
      {/*            //@ts-ignore*/}
      {/*            marketGroup={preparedMarketGroup}*/}
      {/*          />*/}
      {/*        )}*/}
      {/*      </MobileDrawer>*/}
      {/*      <Button*/}
      {/*        variant='transparent'*/}
      {/*        onClick={() => {*/}
      {/*          trackClicked(ClickEvent.MarketPageOpened, {*/}
      {/*            bannerPosition: position,*/}
      {/*            platform: 'mobile',*/}
      {/*            bannerType: 'Standard banner',*/}
      {/*            source: 'Explore Market',*/}
      {/*            marketCategory: category,*/}
      {/*            marketGroup: marketGroup.title,*/}
      {/*            marketType: 'group',*/}
      {/*            page: 'Market Page',*/}
      {/*          })*/}
      {/*          trackClicked(ClickEvent.MediumMarketBannerClicked, {*/}
      {/*            bannerPosition: position,*/}
      {/*            bannerPaginationPage: 1,*/}
      {/*          })*/}
      {/*          router.push(`/market-group/${marketGroup.slug}`)*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        Open market <ArrowRightIcon width={16} height={16} />*/}
      {/*      </Button>*/}
      {/*    </HStack>*/}
      {/*  </>*/}
      {/*)}*/}
    </Paper>
  )

  return (
    <NextLink href={`/market-group/${marketGroup.slug}`} style={{ width: '100%' }}>
      {content}
    </NextLink>
  )

  // return isMobile ? (
  //   content
  // ) : (
  //   <Box w='full' position='relative'>
  //     <NextLink href={`/market-group/${marketGroup.slug}`} style={{ width: '100%' }}>
  //       {content}
  //     </NextLink>
  //     {tradingWidgetOpened && selectedMarket && (
  //       <Box
  //         position='absolute'
  //         top={positionFromBottom > -7 ? 'unset' : '0'}
  //         bottom={positionFromBottom > -7 ? '0' : 'unset'}
  //         right={'-352px'}
  //         ref={ref as LegacyRef<HTMLDivElement>}
  //       >
  //         <MarketTradingForm
  //           market={selectedMarket}
  //           analyticParams={{ quickBetSource: 'Standard banner', source: 'Quick Bet' }}
  //           showTitle={true}
  //           setSelectedMarket={setMarket}
  //           //@ts-ignore
  //           marketGroup={preparedMarketGroup}
  //         />
  //       </Box>
  //     )}
  //   </Box>
  // )
}
