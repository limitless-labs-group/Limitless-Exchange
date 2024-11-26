import { AvatarGroup, Box, Button, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import Avatar from '@/components/common/avatar'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import Paper from '@/components/common/paper'
import ProgressBar from '@/components/common/progress-bar'
import Skeleton from '@/components/common/skeleton'
import { MarketCardLink } from './market-card-link'
import { useCalculateNoReturn, useCalculateYesReturn } from '@/hooks/use-calculate-return'
import { useMarketFeed } from '@/hooks/use-market-feed'
import CloseIcon from '@/resources/icons/close-icon.svg'
import TooltipIcon from '@/resources/icons/tooltip-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import {
  captionMedium,
  paragraphBold,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface DailyMarketCardProps {
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

export default function DailyMarketCard({ market, analyticParams }: DailyMarketCardProps) {
  const [hovered, setHovered] = useState(false)
  const [estimateOpened, setEstimateOpened] = useState(false)
  const { onOpenMarketPage, market: selectedMarket } = useTradingService()
  const router = useRouter()
  const { data: marketFeedData } = useMarketFeed(market?.address || '')

  const { data: yesReturn, isLoading: yesLoading } = useCalculateYesReturn(
    market?.address,
    estimateOpened
  )
  const { data: noReturn, isLoading: noLoading } = useCalculateNoReturn(
    market?.address,
    estimateOpened
  )

  const onClickRedirectToMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    e.preventDefault()
    router.push(`?market=${market.address}`, { scroll: false })
    trackClicked(ClickEvent.MediumMarketBannerClicked, {
      ...analyticParams,
    })
    onOpenMarketPage(market, 'Medium Banner')
  }

  const uniqueUsersTrades = useMemo(() => {
    if (marketFeedData?.data.length) {
      const uniqueUsers = new Map()

      for (const event of marketFeedData.data) {
        if (!uniqueUsers.has(event.user?.account)) {
          uniqueUsers.set(event.user?.account, event)
        }
        if (uniqueUsers.size >= 3) break
      }

      return Array.from(uniqueUsers.values())
    }
    return null
  }, [marketFeedData])

  const isLumy = market?.category === 'Lumy'

  const { trackClicked } = useAmplitude()

  const handleLumyButtonClicked = (e: SyntheticEvent) => {
    e.stopPropagation()
    router.push('/lumy')
  }

  const onClickJoinPrediction = () => {
    trackClicked(ClickEvent.JoinPredictionClicked, {
      marketAddress: market.address,
      marketTags: market.tags,
      marketType: 'single',
    })
  }

  useEffect(() => {
    if (selectedMarket && selectedMarket.address !== market.address) {
      setHovered(false)
    }
    if (!selectedMarket && hovered) {
      setHovered(false)
    }
  }, [selectedMarket, market])

  const onEstimteEarningOpenClicked = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    trackClicked(ClickEvent.EstimateEarningClicked, {
      marketAddress: market.address,
      marketType: 'single',
      marketTags: market.tags,
      marketCategory: market.category,
    })
    setEstimateOpened(true)
  }

  const onCloseEstimateClicked = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEstimateOpened(false)
  }

  const content = (
    <Box
      w='full'
      bg={
        isLumy
          ? 'linear-gradient(90deg, #5F1BEC 0%, #FF3756 27.04%, #FFCB00 99.11%)'
          : hovered
          ? 'grey.300'
          : 'grey.100'
      }
      rounded='12px'
      p='2px'
      _hover={{
        ...(!isLumy ? { bg: 'grey.300' } : {}),
      }}
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        if (selectedMarket?.address !== market.address) {
          setHovered(false)
        }
      }}
      onClick={(event) => {
        trackClicked(ClickEvent.MediumMarketBannerClicked, {
          ...analyticParams,
        })
        onClickRedirectToMarket(event)
        onOpenMarketPage(market, 'Medium Banner')
      }}
    >
      <Paper flex={1} w={'100%'} position='relative' cursor='pointer' p='14px'>
        <VStack w='full' gap='32px'>
          <Box w='full'>
            <DailyMarketTimer
              deadline={market.expirationTimestamp}
              deadlineText={market.expirationDate}
              {...paragraphRegular}
              color='grey.500'
            />
            <Text {...paragraphBold} fontSize='20px' mt='4px'>
              {market.title}
            </Text>
          </Box>
          <Box w='full'>
            <HStack w='full' justifyContent='space-between' mb='4px'>
              <Text {...paragraphMedium} color='#0FC591'>
                Yes {market?.prices[0]}% (Predicted to Happen)
              </Text>
              <Text {...paragraphMedium} color='#FF3756'>
                No {market?.prices[1]}% (Unlikely to Happen)
              </Text>
            </HStack>
            <ProgressBar variant='market' value={market.prices[0]} />
          </Box>
          <Box w='full'>
            <Divider orientation='horizontal' borderColor='grey.200' color='grey.200' />
            <HStack w='full' mt='16px' justifyContent='space-between'>
              <HStack gap='8px'>
                <Button
                  variant='grey'
                  bg={hovered ? 'grey.300' : 'grey.200'}
                  py='8px'
                  {...paragraphMedium}
                  h='unset'
                  onClick={onClickJoinPrediction}
                >
                  ⚖️ Join the Prediction
                </Button>
                {market.collateralToken.symbol === 'USDC' && (
                  <Button
                    variant='transparent'
                    onClick={onEstimteEarningOpenClicked}
                    py='8px'
                    h='unset'
                  >
                    🤑 Estimate Earnings
                  </Button>
                )}
              </HStack>
              <HStack gap='4px'>
                <HStack gap='4px'>
                  <HStack gap={0}>
                    {uniqueUsersTrades?.map(({ user }, index) => (
                      <Avatar
                        account={user.account || ''}
                        avatarUrl={user.imageURI}
                        key={index}
                        borderColor='grey.100'
                        zIndex={100 + index}
                        border='2px solid'
                        color='grey.100 !important'
                        showBorder
                        bg='grey.100'
                        size='20px'
                        style={{
                          border: '2px solid',
                          marginLeft: index > 0 ? '-6px' : 0,
                        }}
                      />
                    ))}
                  </HStack>
                  <Text {...paragraphRegular} color='grey.500'>
                    Volume
                  </Text>
                </HStack>
                <Text {...paragraphRegular} color='grey.500'>
                  {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
                  {market.collateralToken.symbol}
                </Text>
              </HStack>
            </HStack>
          </Box>
        </VStack>
        {isLumy && (
          <Box
            position='absolute'
            top={0}
            left='calc(50% - 30px)'
            py='2px'
            px='4px'
            borderBottomLeftRadius='4px'
            borderBottomRightRadius='2px'
            bg={'linear-gradient(90deg, #FF444F -14%, #FF7A30 100%)'}
            onClick={handleLumyButtonClicked}
            className='lumy-button'
          >
            <HStack gap='8px' color='grey.white'>
              <Text {...captionMedium} color='grey.white'>
                LUMY AI
              </Text>
              <TooltipIcon width={16} height={16} />
            </HStack>
          </Box>
        )}
        {estimateOpened && (
          <Box bg='grey.200' p='16px' mt='16px' borderRadius='12px'>
            <HStack w='full' justifyContent='space-between' color='grey.500'>
              <Text {...paragraphMedium} fontSize='16px'>
                🤑 Estimated Earnings
              </Text>
              <button onClick={onCloseEstimateClicked}>
                <CloseIcon width={16} height={16} />
              </button>
            </HStack>
            <Text mt='8px' {...paragraphRegular}>
              Curious about potential rewards? Here’s how it works:
            </Text>
            <Box my='16px'>
              <HStack gap={0}>
                <Text {...paragraphRegular}>
                  <strong>If “Yes” wins:</strong> 100 USDC could earn&nbsp;
                </Text>
                {yesLoading ? (
                  <Box w='72px' ml='2px'>
                    <Skeleton height={16} />
                  </Box>
                ) : (
                  <strong>{NumberUtil.formatThousands(yesReturn, 2)} USDC</strong>
                )}
              </HStack>
              <HStack gap={0}>
                <Text {...paragraphRegular}>
                  <strong>If “No” wins:</strong> 100 USDC could earn&nbsp;
                </Text>
                {noLoading ? (
                  <Box w='72px' ml='2px'>
                    <Skeleton height={16} />
                  </Box>
                ) : (
                  <strong>{NumberUtil.formatThousands(noReturn, 6)} USDC</strong>
                )}
              </HStack>
            </Box>
            {/*<NextLink*/}
            {/*  href='https://www.notion.so/limitlesslabs/Limitless-Docs-0e59399dd44b492f8d494050969a1567?pvs=4#5dd6f962c66044eaa00e28d2c61b92bb'*/}
            {/*  target='_blank'*/}
            {/*  rel='noopener'*/}
            {/*  passHref*/}
            {/*  onClick={(e) => e.stopPropagation()}*/}
            {/*>*/}
            {/*  <Link isExternal variant='textLink'>*/}
            {/*    Read How Prediction Market works.*/}
            {/*  </Link>*/}
            {/*</NextLink>*/}
          </Box>
        )}
      </Paper>
    </Box>
  )

  return isLumy ? (
    content
  ) : (
    <MarketCardLink marketAddress={market?.address}>{content}</MarketCardLink>
  )
}
