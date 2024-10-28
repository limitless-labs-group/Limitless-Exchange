import { Box, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import Avatar from '@/components/common/avatar'
import MobileDrawer from '@/components/common/drawer'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import MarketPage from '@/components/common/markets/market-page'
import { MarketFeedData, useMarketFeed } from '@/hooks/use-market-feed'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { useTradingService } from '@/services'
import { headLineLarge, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil, truncateEthAddress } from '@/utils'

const MotionBox = motion(Box)

interface BigBannerProps {
  market: Market
}

export default function BigBanner({ market }: BigBannerProps) {
  const [feedMessage, setFeedMessage] = useState<MarketFeedData | null>(null)
  const { onCloseMarketPage, onOpenMarketPage } = useTradingService()
  const { data: marketFeedData } = useMarketFeed(market.address)

  const onClickRedirectToMarket = () => {
    onOpenMarketPage(market, 'Big Banner')
  }

  useEffect(() => {
    if (!feedMessage && marketFeedData?.data?.length) {
      setFeedMessage(marketFeedData.data[0])
      return
    }
    if (
      feedMessage &&
      marketFeedData?.data?.length &&
      marketFeedData.data[0].bodyHash !== feedMessage.bodyHash
    ) {
      setFeedMessage(marketFeedData.data[0])
      return
    }
  }, [feedMessage, marketFeedData])

  const fetMarketFeedTitle = (message: MarketFeedData | null) => {
    if (message && feedMessage === message) {
      const title = message.data.strategy === 'Buy' ? 'bought' : 'sold'
      const outcome = message.data.outcome
      return `${
        ethers.utils.isAddress(feedMessage?.user?.name ?? '')
          ? truncateEthAddress(feedMessage?.user?.account)
          : feedMessage?.user?.name ?? truncateEthAddress(feedMessage?.user?.account)
      }
         ${title} ${NumberUtil.formatThousands(
        message.data.contracts,
        6
      )} contracts ${outcome} for ${NumberUtil.convertWithDenomination(
        Math.abs(+message.data.tradeAmount),
        6
      )} ${message.data.symbol} in total.`
    }
  }

  const content = (
    <VStack
      w='full'
      justifyContent='space-between'
      bg='lime.500'
      p='16px'
      borderRadius='2px'
      h={'324px'}
      cursor='pointer'
      onClick={onClickRedirectToMarket}
    >
      <Text {...headLineLarge}>{market.proxyTitle ?? market.title ?? 'Noname market'}</Text>
      <Box w='full' h='38px'></Box>
      <Box w='full'>
        {isMobile ? (
          <>
            <HStack w='full' justifyContent='space-between'>
              <HStack gap='4px'>
                <HStack color='black' gap='4px'>
                  <VolumeIcon width={16} height={16} />
                  <Text {...paragraphMedium} color='black'>
                    {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                </HStack>
              </HStack>
              <HStack gap='4px'>
                <HStack gap={1} color='black'>
                  <Text {...paragraphMedium} color='black'>
                    {market.prices[0]}%
                  </Text>
                  <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
                    <Box
                      h='100%'
                      w='100%'
                      borderRadius='100%'
                      bg={`conic-gradient(black ${market.prices[0]}% 10%, rgba(0, 0, 0, 0.2) ${market.prices[0]}% 100%)`}
                    />
                  </Box>
                </HStack>
              </HStack>
            </HStack>
            <HStack w='full' justifyContent='space-between' mt='8px'>
              <HStack gap='4px'>
                <HStack color='black' gap='4px'>
                  <LiquidityIcon width={16} height={16} />
                  <Text {...paragraphMedium} color='black'>
                    {NumberUtil.convertWithDenomination(market.liquidityFormatted, 6)}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                </HStack>
              </HStack>
              <HStack gap='4px'>
                <DailyMarketTimer deadline={market.expirationTimestamp} color='black' />
              </HStack>
            </HStack>
          </>
        ) : (
          <HStack w='full' justifyContent='space-between'>
            <DailyMarketTimer deadline={market.expirationTimestamp} color='black' />
            <HStack gap='16px'>
              <HStack color='black' gap='4px'>
                <LiquidityIcon width={16} height={16} />
                <Text {...paragraphMedium} color='black'>
                  {NumberUtil.convertWithDenomination(market.liquidityFormatted, 6)}{' '}
                  {market.collateralToken.symbol}
                </Text>
              </HStack>
              <HStack gap='4px' color='black'>
                <HStack color='black' gap='4px'>
                  <VolumeIcon width={16} height={16} />
                  <Text {...paragraphMedium} color='black'>
                    {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                </HStack>
              </HStack>
              <HStack gap={1} color='black'>
                <Text {...paragraphMedium} color='black'>
                  {market.prices[0]}%
                </Text>
                <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
                  <Box
                    h='100%'
                    w='100%'
                    borderRadius='100%'
                    bg={`conic-gradient(black ${market.prices[0]}% 10%, rgba(0, 0, 0, 0.2) ${market.prices[0]}% 100%)`}
                  />
                </Box>
              </HStack>
            </HStack>
          </HStack>
        )}
        <Divider
          orientation='horizontal'
          mt={'12px'}
          mb='8px'
          w='full'
          color='rgba(0, 0, 0, 0.2)'
        />
        {isMobile ? null : (
          <HStack w='full' justifyContent='space-between'>
            {feedMessage && (
              <Box mt='12px'>
                <AnimatePresence>
                  <MotionBox
                    initial={{ y: -48, opacity: 0 }}
                    animate={{ y: -8, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    position='absolute'
                    width='100%'
                    display='flex'
                    alignItems='center'
                    gap='8px'
                    key={feedMessage.bodyHash}
                  >
                    <HStack gap='4px' alignItems='flex-start'>
                      <Avatar account={feedMessage?.user?.account ?? ''} />
                      <Text {...paragraphMedium} color='black' mt='-2px'>
                        {fetMarketFeedTitle(feedMessage)}
                      </Text>
                    </HStack>
                  </MotionBox>
                </AnimatePresence>
              </Box>
            )}
          </HStack>
        )}
      </Box>
    </VStack>
  )

  return isMobile ? (
    <MobileDrawer
      trigger={content}
      variant='black'
      title={market.proxyTitle ?? market.title ?? 'Noname market'}
      onClose={onCloseMarketPage}
    >
      <MarketPage />
    </MobileDrawer>
  ) : (
    content
  )
}
