import { Box, Divider, HStack, Icon, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import Paper from '@/components/common/paper'
import ActiveIcon from '@/resources/icons/active-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ClosedIcon from '@/resources/icons/close-rounded-icon.svg'
import { ClickEvent, ClobPositionWithType, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

export interface PortfolioPositionCardClobProps {
  position: ClobPositionWithType
}

const unhoveredColors = {
  main: 'grey.800',
  secondary: 'grey.500',
  contracts: '',
}

const hoverColors = {
  main: 'white',
  secondary: 'transparent.700',
  contracts: 'white',
}

const StatusIcon = ({ isClosed, color }: { isClosed: boolean | undefined; color: string }) => {
  return isClosed ? (
    <>
      <Icon as={ClosedIcon} width={'16px'} height={'16px'} color={color} />
      <Text {...paragraphMedium} color={color}>
        Closed
      </Text>
    </>
  ) : (
    <>
      <ActiveIcon width={16} height={16} />
      <Text {...paragraphMedium} color={color}>
        Active
      </Text>
    </>
  )
}

const PortfolioPositionCardClob = ({ position }: PortfolioPositionCardClobProps) => {
  const [colors, setColors] = useState(unhoveredColors)

  const { trackClicked } = useAmplitude()
  const { redeem, onOpenMarketPage, setMarket, setMarketGroup } = useTradingService()

  const marketClosed = position.market.status === MarketStatus.RESOLVED

  console.log(position)

  // const targetMarket = allMarkets.find((market) => market.address === position.market.id)
  //
  // const contractsAmount = `${position.outcomeTokenAmount} ${
  //   position.outcomeTokenAmounts?.[0] ? 'Yes' : 'No'
  // } contracts`
  //
  // const contractsColor = useMemo(() => {
  //   if (colors.contracts) {
  //     return colors.contracts
  //   }
  //   return position.outcomeTokenAmounts?.[0] ? 'green.500' : 'red.500'
  // }, [colors.contracts, position.outcomeTokenAmounts])

  // const contractPrice = new BigNumber(prices?.prices?.[position.outcomeIndex] ?? 1)
  //   .dividedBy(100)
  //   .dividedBy(
  //     (() => {
  //       const price = position.latestTrade?.outcomeTokenPrice
  //         ? +position.latestTrade.outcomeTokenPrice
  //         : 1
  //       return price === 0 ? 1 : price
  //     })()
  //   )
  //   .toNumber()

  // const contractPriceChanged = useMemo(() => {
  //   let price
  //   if (contractPrice < 1) {
  //     price = NumberUtil.toFixed((1 - contractPrice) * 100, 0)
  //   } else {
  //     price = NumberUtil.toFixed((contractPrice - 1) * 100, 0)
  //   }
  //   if (contractPrice < 1) {
  //     return (
  //       <Text {...paragraphMedium} color={colors.main === 'white' ? 'white' : 'red.500'}>
  //         &#x2193;
  //         {price}%
  //       </Text>
  //     )
  //   }
  //   return (
  //     <Text {...paragraphMedium} color={colors.main === 'white' ? 'white' : 'green.500'}>
  //       &#x2191;
  //       {price}%
  //     </Text>
  //   )
  // }, [contractPrice, colors.main])

  // const getOutcomeNotation = () => {
  //   const outcomeTokenId = position.outcomeIndex ?? 0
  //   const defaultOutcomes = ['Yes', 'No']
  //
  //   return defaultOutcomes[outcomeTokenId]
  // }

  const { data: oneMarket, refetch: refetchMarket } = useMarket(position.market.slug, false, false)
  // const { data: marketGroup, refetch: refetchMarketGroup } = useMarketGroup(
  //   targetMarket?.group?.slug,
  //   false,
  //   false
  // )

  const handleOpenMarketPage = async () => {
    if (!oneMarket) {
      const { data: fetchedMarket } = await refetchMarket()
      if (fetchedMarket) {
        onOpenMarketPage(fetchedMarket)
        trackClicked(ClickEvent.PortfolioMarketClicked, {
          marketCategory: fetchedMarket.category,
          marketAddress: fetchedMarket.slug,
          marketType: 'single',
          marketTags: fetchedMarket.tags,
          type: 'Portolio',
        })
      }
    } else {
      onOpenMarketPage(oneMarket)
      trackClicked(ClickEvent.PortfolioMarketClicked, {
        marketCategory: oneMarket.category,
        marketAddress: oneMarket.slug,
        marketType: 'single',
        marketTags: oneMarket.tags,
        type: 'Portolio',
      })
    }

    // if (targetMarket?.group?.slug) {
    //   if (!marketGroup) {
    //     const { data: fetchedMarketGroup } = await refetchMarketGroup()
    //     if (fetchedMarketGroup) {
    //       onOpenMarketPage(fetchedMarketGroup)
    //     }
    //   } else {
    //     onOpenMarketPage(marketGroup)
    //   }
    // }
  }

  // const ClaimButton = () => {
  //   return (
  //     <Button
  //       variant='white'
  //       onClick={async (e: SyntheticEvent) => {
  //         e.stopPropagation()
  //         setIsLoadingRedeem(true)
  //         trackClicked(ClickEvent.ClaimRewardOnPortfolioClicked, {
  //           platform: isMobile ? 'mobile' : 'desktop',
  //         })
  //         await redeem({
  //           conditionId: position.market.condition_id as Address,
  //           collateralAddress: position.market.collateral?.id as Address,
  //           marketAddress: position.market.id,
  //           outcomeIndex: position.latestTrade?.outcomeIndex as number,
  //         })
  //         setIsLoadingRedeem(false)
  //       }}
  //       minW='162px'
  //     >
  //       {isLoadingRedeem ? (
  //         <Loader />
  //       ) : (
  //         <>
  //           <Icon as={WinIcon} color={'black'} />
  //           Claim{' '}
  //           {`${NumberUtil.formatThousands(position.outcomeTokenAmount, 6)} ${
  //             position.market.collateral?.symbol
  //           }`}
  //         </>
  //       )}
  //     </Button>
  //   )
  // }

  const cardColors = useMemo(() => {
    if (marketClosed) {
      return {
        main: 'white',
        secondary: isMobile ? 'white' : 'transparent.700',
      }
    }
    return {
      main: colors.main,
      secondary: colors.secondary,
    }
  }, [marketClosed, colors.main, colors.secondary])

  const deadline = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(position.market.deadline))

  const content = (
    <Paper
      onClick={handleOpenMarketPage}
      w={'full'}
      _hover={{
        bg: marketClosed ? 'green.600' : 'blue.500',
      }}
      onMouseEnter={() => setColors(hoverColors)}
      onMouseLeave={() => setColors(unhoveredColors)}
      bg={marketClosed ? 'green.500' : 'grey.200'}
      borderRadius='8px'
      cursor='pointer'
    >
      <HStack w='full' justifyContent='space-between'>
        <Text {...paragraphMedium} color={cardColors.main}>
          {position.market.title}
        </Text>
        {isMobile && (
          <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={cardColors.main} />
        )}
      </HStack>
      {isMobile && (
        <>
          <HStack color={cardColors.secondary} mt='8px'>
            <HStack gap={1}>
              {<StatusIcon isClosed={marketClosed} color={cardColors.secondary} />}
            </HStack>
            <HStack gap={1} color={cardColors.secondary}>
              <CalendarIcon width={'16px'} height={'16px'} />
              <Text {...paragraphMedium} color={cardColors.secondary}>
                {deadline}
              </Text>
            </HStack>
          </HStack>
          <Divider w={'full'} h={'1px'} mb={'10px'} mt={'10px'} />
        </>
      )}
      <HStack w='full' justifyContent='space-between' alignItems='flex-end' mt='16px'>
        <Box w={isMobile ? 'full' : 'unset'}>
          <HStack gap='12px' w={isMobile ? 'full' : 'unset'}>
            <Text
              {...paragraphMedium}
              color={cardColors.secondary}
              w={isMobile ? 'unset' : '60px'}
              flex={isMobile ? 1 : 'unset'}
              textAlign={isMobile ? 'left' : 'unset'}
            >
              Position
            </Text>
            <Text
              {...paragraphMedium}
              color={cardColors.secondary}
              w={isMobile ? 'unset' : '120px'}
              flex={isMobile ? 1 : 'unset'}
              textAlign={isMobile ? 'left' : 'center'}
            >
              Contracts
            </Text>
          </HStack>
          {Boolean(+position.tokensBalance.yes) && (
            <HStack gap='12px' mt='4px' w={isMobile ? 'full' : 'unset'}>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '60px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'unset'}
              >
                Yes
              </Text>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '120px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'center'}
              >
                {`${NumberUtil.toFixed(
                  formatUnits(
                    BigInt(position.tokensBalance.yes),
                    position.market.collateralToken.decimals
                  ),
                  6
                )}`}
              </Text>
            </HStack>
          )}
          {Boolean(+position.tokensBalance.no) && (
            <HStack gap='12px' mt='4px' w={isMobile ? 'full' : 'unset'}>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '60px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'unset'}
              >
                No
              </Text>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '120px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'center'}
              >
                {`${NumberUtil.toFixed(
                  formatUnits(
                    BigInt(position.tokensBalance.no),
                    position.market.collateralToken.decimals
                  ),
                  6
                )}`}
              </Text>
            </HStack>
          )}
        </Box>
        {!isMobile && (
          <HStack color={cardColors.secondary} mt='8px'>
            <HStack gap={1}>
              {<StatusIcon isClosed={marketClosed} color={cardColors.secondary} />}
            </HStack>
            <HStack gap={1} color={cardColors.secondary}>
              <CalendarIcon width={'16px'} height={'16px'} />
              <Text {...paragraphMedium} color={cardColors.secondary}>
                {deadline}
              </Text>
            </HStack>
          </HStack>
        )}
      </HStack>
    </Paper>
  )

  return isMobile ? (
    <MobileDrawer
      trigger={content}
      variant='black'
      onClose={() => {
        setMarket(null)
        setMarketGroup(null)
      }}
    >
      <MarketPage />
    </MobileDrawer>
  ) : (
    content
  )
}

export default PortfolioPositionCardClob
