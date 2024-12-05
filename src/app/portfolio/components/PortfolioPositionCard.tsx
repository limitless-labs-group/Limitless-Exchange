import { HStack, Stack, Text, Box, Icon, VStack, Button, Divider } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { SyntheticEvent, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import MobileDrawer from '@/components/common/drawer'
import Loader from '@/components/common/loader'
import MarketPage from '@/components/common/markets/market-page'
import Paper from '@/components/common/paper'
import Skeleton from '@/components/common/skeleton'
import useMarketGroup from '@/hooks/use-market-group'
import ActiveIcon from '@/resources/icons/active-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ClosedIcon from '@/resources/icons/close-rounded-icon.svg'
import WinIcon from '@/resources/icons/win-icon.svg'
import { ClickEvent, HistoryPosition, useAmplitude, useTradingService } from '@/services'
import { useAllMarkets, useMarket } from '@/services/MarketsService'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export interface IPortfolioPositionCard {
  position: HistoryPosition
}

const unhoveredColors = {
  main: 'grey.800',
  secondary: 'grey.500',
}

const hoverColors = {
  main: 'white',
  secondary: 'transparent.700',
}

const PortfolioPositionCard = ({ position }: IPortfolioPositionCard) => {
  const [colors, setColors] = useState(unhoveredColors)
  const [isLoadingRedeem, setIsLoadingRedeem] = useState(false)

  const { trackClicked } = useAmplitude()
  const { redeem, onOpenMarketPage, setMarket, setMarketGroup } = useTradingService()

  /**
   * MARKET DATA
   */
  const { data: market } = useMarket(position.market.id)

  const allMarkets = useAllMarkets()

  const targetMarket = allMarkets.find((market) => market.address === position.market.id)

  const { data: marketGroup } = useMarketGroup(targetMarket?.group?.slug)

  const contractPrice = new BigNumber(market?.prices[position.outcomeIndex] || 1)
    .dividedBy(100)
    .dividedBy(
      new BigNumber(
        position.latestTrade?.outcomeTokenPrice ? +position.latestTrade.outcomeTokenPrice : 1
      )
    )
    .toNumber()

  const contractPriceChanged = useMemo(() => {
    let price
    if (contractPrice < 1) {
      price = NumberUtil.toFixed((1 - contractPrice) * 100, 0)
    } else {
      price = NumberUtil.toFixed((contractPrice - 1) * 100, 0)
    }
    if (contractPrice < 1) {
      return (
        <Text {...paragraphMedium} color={colors.main === 'white' ? 'white' : 'red.500'}>
          &#x2193;
          {price}%
        </Text>
      )
    }
    return (
      <Text {...paragraphMedium} color={colors.main === 'white' ? 'white' : 'green.500'}>
        &#x2191;
        {price}%
      </Text>
    )
  }, [contractPrice, colors.main])

  const getOutcomeNotation = () => {
    const outcomeTokenId = position.outcomeIndex ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return defaultOutcomes[outcomeTokenId]
  }

  const handleOpenMarketPage = () => {
    if (marketGroup) {
      onOpenMarketPage(marketGroup, 'Portfolio Card')
      return
    }
    if (market) {
      onOpenMarketPage(market, 'Portfolio Card')
      return
    }
  }

  const ClaimButton = () => {
    return (
      <Button
        variant='white'
        onClick={async (e: SyntheticEvent) => {
          e.stopPropagation()
          setIsLoadingRedeem(true)
          trackClicked(ClickEvent.ClaimRewardOnPortfolioClicked, {
            platform: isMobile ? 'mobile' : 'desktop',
          })
          await redeem({
            conditionId: market?.conditionId as Address,
            collateralAddress: market?.collateralToken.address as Address,
            marketAddress: market?.address as Address,
            outcomeIndex: market?.winningOutcomeIndex as number,
          })
          setIsLoadingRedeem(false)
        }}
        minW='162px'
      >
        {isLoadingRedeem ? (
          <Loader />
        ) : (
          <>
            <Icon as={WinIcon} color={'black'} />
            Claim{' '}
            {`${NumberUtil.formatThousands(position.outcomeTokenAmount, 6)} ${
              market?.collateralToken.symbol
            }`}
          </>
        )}
      </Button>
    )
  }

  const cardColors = useMemo(() => {
    if (market?.expired) {
      return {
        main: 'white',
        secondary: isMobile ? 'white' : 'transparent.700',
      }
    }
    return {
      main: colors.main,
      secondary: colors.secondary,
    }
  }, [market, colors])

  //@ts-ignore
  const StatusIcon = ({ market }) =>
    market?.expired ? (
      <>
        <Icon as={ClosedIcon} width={'16px'} height={'16px'} color={cardColors.secondary} />
        <Text {...paragraphMedium} color={cardColors.secondary}>
          Closed
        </Text>
      </>
    ) : (
      <>
        <ActiveIcon width={16} height={16} />
        <Text {...paragraphMedium} color={cardColors.secondary}>
          Active
        </Text>
      </>
    )

  return isMobile ? (
    <MobileDrawer
      trigger={
        <Paper
          onClick={handleOpenMarketPage}
          w={'full'}
          bg={market?.expired ? 'green.500' : 'grey.200'}
          p={'16px'}
          borderRadius='8px'
        >
          <Stack spacing={'8px'}>
            <HStack w={'full'} spacing={1} justifyContent={'space-between'}>
              <Text {...paragraphMedium} color={cardColors.main}>
                {targetMarket?.proxyTitle ?? targetMarket?.title}
              </Text>
              <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={cardColors.main} />
            </HStack>
            <HStack>
              {market?.expired ? (
                <Text {...paragraphMedium} color={cardColors.main}>
                  {`Won ${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} ${
                    market?.collateralToken.symbol
                  }`}
                </Text>
              ) : (
                <HStack>
                  {!market ? (
                    <Skeleton height={20} />
                  ) : (
                    <Text fontSize={'16px'} lineHeight={'20px'} fontWeight={500}>
                      {`${NumberUtil.toFixed(
                        new BigNumber(position.outcomeTokenAmount || '1')
                          .multipliedBy(
                            new BigNumber(market?.prices?.[position.outcomeIndex] || 1).dividedBy(
                              100
                            )
                          )
                          .toString(),
                        6
                      )} ${market?.collateralToken.symbol}`}
                    </Text>
                  )}
                  <Box gap={0} fontSize={'16px'} fontWeight={500}>
                    {contractPriceChanged}
                  </Box>
                </HStack>
              )}
            </HStack>
            <HStack color={cardColors.secondary}>
              <HStack gap={1}>{<StatusIcon market={market} />}</HStack>
              <HStack gap={1} color={cardColors.secondary}>
                <CalendarIcon width={'16px'} height={'16px'} />
                <Text {...paragraphMedium} color={cardColors.secondary}>
                  {market?.expirationDate}
                </Text>
              </HStack>
            </HStack>
            <HStack>{market?.expired && <ClaimButton />}</HStack>
          </Stack>

          <Divider w={'full'} h={'1px'} mb={'10px'} mt={'10px'} />

          <Stack w={'full'}>
            <HStack alignItems={'start'} gap={0} justifyContent={'space-between'}>
              <Text {...paragraphMedium} color={cardColors.secondary}>
                Position
              </Text>
              <Text color={cardColors.main} fontWeight={400} lineHeight={'20px'} fontSize={'16px'}>
                {getOutcomeNotation()}
              </Text>
            </HStack>
          </Stack>
          <Stack w={'full'} mt={'8px'}>
            <HStack alignItems={'start'} gap={0} justifyContent={'space-between'}>
              <Text {...paragraphMedium} color={cardColors.secondary}>
                Invested
              </Text>
              <Text color={cardColors.main} lineHeight={'20px'} fontWeight={400} fontSize={'16px'}>
                {`${NumberUtil.toFixed(position.collateralAmount, 6)} ${
                  market?.collateralToken.symbol
                }`}
              </Text>
            </HStack>
          </Stack>
        </Paper>
      }
      variant='black'
      onClose={() => {
        setMarket(null)
        setMarketGroup(null)
      }}
    >
      <MarketPage />
    </MobileDrawer>
  ) : (
    <Paper
      w={'full'}
      bg={market?.expired ? 'green.500' : 'grey.200'}
      _hover={{
        bg: market?.expired ? 'green.600' : 'blue.500',
      }}
      cursor='pointer'
      onMouseEnter={() => setColors(hoverColors)}
      onMouseLeave={() => setColors(unhoveredColors)}
      onClick={handleOpenMarketPage}
      borderRadius='8px'
    >
      <Stack direction='row'>
        <HStack w={'full'} spacing={1} justifyContent={'space-between'}>
          <Box>
            <Text {...paragraphMedium} color={cardColors.main}>
              {targetMarket?.proxyTitle ?? targetMarket?.title}
            </Text>
          </Box>

          <HStack>
            {market?.expired ? (
              <ClaimButton />
            ) : (
              <>
                {!market ? (
                  <Box w='120px'>
                    <Skeleton height={20} />
                  </Box>
                ) : (
                  <>
                    <Text {...paragraphMedium} color={cardColors.main}>
                      {`${NumberUtil.toFixed(
                        new BigNumber(position.outcomeTokenAmount || '1')
                          .multipliedBy(
                            new BigNumber(market?.prices?.[position.outcomeIndex] || 1).dividedBy(
                              100
                            )
                          )
                          .toString(),
                        market.collateralToken.symbol === 'USDC' ? 2 : 6
                      )} ${market?.collateralToken.symbol}`}
                    </Text>
                    <Box gap={0}>{contractPriceChanged}</Box>
                  </>
                )}
              </>
            )}
          </HStack>
        </HStack>
      </Stack>

      <Stack direction='row' w={'full'} justifyContent={'space-between'} mt={'12px'}>
        <HStack w={'full'}>
          <VStack alignItems={'start'} gap={1}>
            <Text {...paragraphMedium} color={cardColors.secondary}>
              Position
            </Text>
            <Text {...paragraphRegular} color={cardColors.main}>
              {getOutcomeNotation()}
            </Text>
          </VStack>

          <VStack alignItems={'start'} gap={1} ml={'24px'}>
            <Text {...paragraphMedium} color={cardColors.secondary}>
              Invested
            </Text>
            <Text {...paragraphRegular} color={cardColors.main}>
              {!market ? (
                <Box w='68px'>
                  <Skeleton height={20} />
                </Box>
              ) : (
                `${NumberUtil.toFixed(
                  position.collateralAmount,
                  market.collateralToken.symbol === 'USDC' ? 2 : 6
                )} ${market?.collateralToken.symbol}`
              )}
            </Text>
          </VStack>
        </HStack>

        <HStack w={'full'} justifyContent={'flex-end'} alignItems={'flex-end'}>
          <HStack gap={1} color={cardColors.secondary}>
            {<StatusIcon market={market} />}
          </HStack>
          <HStack gap={1} color={cardColors.secondary}>
            <CalendarIcon width={'16px'} height={'16px'} />
            <Text {...paragraphMedium} color={cardColors.secondary}>
              {market?.expirationDate}
            </Text>
          </HStack>
        </HStack>
      </Stack>
    </Paper>
  )
}

export default PortfolioPositionCard
