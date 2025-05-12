import { HStack, Stack, Text, Box, Icon, VStack, Divider } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import MobileDrawer from '@/components/common/drawer'
import ClaimButton from '@/components/common/markets/claim-button'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import MarketPage from '@/components/common/markets/market-page'
import Skeleton from '@/components/common/skeleton'
import { ShareWinningButton } from './share-winning-button'
import ActiveIcon from '@/resources/icons/active-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ClosedIcon from '@/resources/icons/close-rounded-icon.svg'
import { ClickEvent, HistoryPosition, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export interface IPortfolioPositionCard {
  position: HistoryPosition
  prices?: {
    address: `0x${string}`
    prices: number[]
  }
}

const unhoveredColors = {
  main: 'grey.800',
  secondary: 'grey.500',
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

const PortfolioPositionCard = ({ position, prices }: IPortfolioPositionCard) => {
  const { trackClicked } = useAmplitude()
  const { onOpenMarketPage, setMarket } = useTradingService()

  const date = new Date(position.market.expirationDate)

  const formatted = date
    .toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace(',', '')

  const contractPrice = new BigNumber(prices?.prices?.[position.outcomeIndex] ?? 1)
    .dividedBy(100)
    .dividedBy(
      (() => {
        const price = position.latestTrade?.outcomeTokenPrice
          ? +position.latestTrade.outcomeTokenPrice
          : 1
        return price === 0 ? 1 : price
      })()
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
        <Text {...paragraphMedium} color={unhoveredColors.main === 'white' ? 'white' : 'red.500'}>
          &#x2193;
          {price}%
        </Text>
      )
    }
    return (
      <Text {...paragraphMedium} color={unhoveredColors.main === 'white' ? 'white' : 'green.500'}>
        &#x2191;
        {price}%
      </Text>
    )
  }, [contractPrice, unhoveredColors.main])

  const getOutcomeNotation = () => {
    const outcomeTokenId = position.outcomeIndex ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return defaultOutcomes[outcomeTokenId]
  }

  const { data: oneMarket, refetch: refetchMarket } = useMarket(position.market.id, false, false)

  const handleOpenMarketPage = async () => {
    if (position.market?.id) {
      if (!oneMarket) {
        const { data: fetchedMarket } = await refetchMarket()
        if (fetchedMarket) {
          onOpenMarketPage(fetchedMarket)
          trackClicked(ClickEvent.PortfolioMarketClicked, {
            marketCategory: fetchedMarket.categories,
            marketAddress: fetchedMarket.slug,
            marketType: fetchedMarket.marketType,
            marketTags: fetchedMarket.tags,
            type: 'Portolio',
          })
        }
      } else {
        onOpenMarketPage(oneMarket)
        trackClicked(ClickEvent.PortfolioMarketClicked, {
          marketCategory: oneMarket.categories,
          marketAddress: oneMarket.slug,
          marketType: oneMarket.marketType,
          marketTags: oneMarket.tags,
          type: 'Portolio',
        })
      }
    }
  }

  const cardColors = useMemo(() => {
    if (position.market.closed) {
      return {
        main: 'white',
        secondary: isMobile ? 'white' : 'whiteAlpha.70',
      }
    }
    return {
      main: unhoveredColors.main,
      secondary: unhoveredColors.secondary,
    }
  }, [position, unhoveredColors])

  return isMobile ? (
    <MobileDrawer
      trigger={
        <Box
          onClick={handleOpenMarketPage}
          cursor='pointer'
          border='2px solid'
          borderColor={position.market?.closed ? 'green.500' : 'grey.100'}
          w={'full'}
          borderRadius='8px'
          _hover={{
            bg: position.market?.closed ? 'green.500' : 'grey.100',
          }}
          bg={position.market?.closed ? 'green.500' : 'unset'}
          p={isMobile ? '16px' : '8px'}
        >
          <Stack spacing={'8px'}>
            <HStack w={'full'} spacing={1} justifyContent={'space-between'}>
              <Text {...paragraphMedium} color={cardColors.main} textAlign='left'>
                {position.market.title}
              </Text>
              <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={cardColors.main} />
            </HStack>
            <HStack>
              {position.market?.closed ? (
                <Text {...paragraphMedium} color={cardColors.main}>
                  {`Won ${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} ${
                    position.market.collateralToken?.symbol
                  }`}
                </Text>
              ) : (
                <HStack>
                  {!position || !prices ? (
                    <Skeleton height={20} />
                  ) : (
                    <Text fontSize={'16px'} lineHeight={'20px'} fontWeight={500}>
                      {`${NumberUtil.toFixed(
                        new BigNumber(position.outcomeTokenAmount || '1')
                          .multipliedBy(
                            new BigNumber(prices?.prices?.[position.outcomeIndex] || 1).dividedBy(
                              100
                            )
                          )
                          .toString(),
                        6
                      )} ${position.market?.collateralToken?.symbol}`}
                    </Text>
                  )}
                  <Box gap={0} fontSize={'16px'} fontWeight={500}>
                    {contractPriceChanged}
                  </Box>
                </HStack>
              )}
            </HStack>
            <HStack color={cardColors.secondary}>
              <HStack gap={1}>
                {<StatusIcon isClosed={position?.market?.closed} color={cardColors.secondary} />}
              </HStack>
              <MarketCountdown
                deadline={date.getTime()}
                deadlineText={formatted}
                showDays={false}
                hideText
                color={position?.market?.closed ? 'whiteAlpha.70' : 'grey.500'}
                ended={position?.market?.closed || false}
              />
            </HStack>
            <HStack>
              {position.market?.closed && (
                <VStack gap='8px' w='full'>
                  <ShareWinningButton slug={position.market.slug ?? ''} width='full' />
                  <ClaimButton
                    conditionId={position.market.conditionId as Address}
                    collateralAddress={position.market.collateralToken?.id as Address}
                    marketAddress={position.market.id}
                    marketType='amm'
                    amountToClaim={position.outcomeTokenAmount as string}
                    symbol={position.market.collateralToken?.symbol as string}
                  />
                </VStack>
              )}
            </HStack>
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
                  position.market?.collateralToken?.symbol
                }`}
              </Text>
            </HStack>
          </Stack>
        </Box>
      }
      variant='black'
      onClose={() => {
        setMarket(null)
      }}
    >
      <MarketPage />
    </MobileDrawer>
  ) : (
    <Box
      cursor='pointer'
      border='2px solid'
      borderColor={position.market?.closed ? 'green.500' : 'grey.100'}
      w={'full'}
      borderRadius='8px'
      _hover={{
        bg: position.market?.closed ? 'green.500' : 'grey.100',
      }}
      bg={position.market?.closed ? 'green.500' : 'unset'}
      p={isMobile ? '16px' : '8px'}
      onClick={handleOpenMarketPage}
    >
      <Stack direction='row'>
        <HStack w={'full'} spacing={1} justifyContent={'space-between'}>
          <Box>
            <Text {...paragraphMedium} color={cardColors.main}>
              {position.market.title}
            </Text>
          </Box>

          <HStack>
            {position.market?.closed ? (
              <HStack gap='8px'>
                <ShareWinningButton slug={position.market.slug ?? ''} />
                <ClaimButton
                  conditionId={position.market.conditionId as Address}
                  collateralAddress={position.market.collateralToken?.id as Address}
                  marketAddress={position.market.id}
                  marketType='amm'
                  amountToClaim={position.outcomeTokenAmount as string}
                  symbol={position.market.collateralToken?.symbol as string}
                />
              </HStack>
            ) : (
              <>
                {!position || !prices ? (
                  <Box w='120px'>
                    <Skeleton height={20} />
                  </Box>
                ) : (
                  <>
                    <Text {...paragraphMedium} color={cardColors.main}>
                      {`${NumberUtil.toFixed(
                        new BigNumber(position.outcomeTokenAmount || '1')
                          .multipliedBy(
                            new BigNumber(prices?.prices?.[position.outcomeIndex] || 1).dividedBy(
                              100
                            )
                          )
                          .toString(),
                        position.market.collateralToken?.symbol === 'USDC' ? 2 : 6
                      )} ${position.market?.collateralToken?.symbol}`}
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
              {!position ? (
                <Box w='68px'>
                  <Skeleton height={20} />
                </Box>
              ) : (
                `${NumberUtil.toFixed(
                  position.collateralAmount,
                  position.market?.collateralToken?.symbol === 'USDC' ? 2 : 6
                )} ${position.market?.collateralToken?.symbol}`
              )}
            </Text>
          </VStack>
        </HStack>

        <HStack w={'full'} justifyContent={'flex-end'} alignItems={'flex-end'}>
          <HStack gap={1} color={cardColors.secondary}>
            {<StatusIcon isClosed={position.market?.closed} color={cardColors.secondary} />}
          </HStack>
          <HStack gap={1} color={cardColors.secondary}>
            <CalendarIcon width={'16px'} height={'16px'} />
            <Text {...paragraphMedium} color={cardColors.secondary}>
              {new Date(position.market?.expirationDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </HStack>
        </HStack>
      </Stack>
    </Box>
  )
}

export default PortfolioPositionCard
