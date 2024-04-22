import { Button, MarketCard } from '@/components'
import { collateralToken, defaultChain, markets } from '@/constants'
import { HistoryMarketStats, createPortfolioShareUrls } from '@/services'
import { borderRadius, colors } from '@/styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Flex, HStack, Image, Stack, StackProps, Text, useClipboard } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import { FaFileInvoiceDollar, FaLink, FaTrophy, FaXTwitter } from 'react-icons/fa6'
import { MobileMarketCard } from '@/components/markets/MobileMarketCard'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'

interface IPortfolioMarketCard extends StackProps {
  marketStats: HistoryMarketStats
}

export const PortfolioMarketCard = ({ marketStats, ...props }: IPortfolioMarketCard) => {
  const market: Market | null = useMemo(
    () =>
      markets.find(
        (market) =>
          market.address[defaultChain.id]?.toLowerCase() === marketStats.market.id.toLowerCase()
      ) ?? null,
    [marketStats, markets]
  )

  const marketURI = `${window.location.origin}/markets/${marketStats.market.id}`

  const shareLinks = createPortfolioShareUrls(market, marketStats)

  return (
    <Flex pos={'relative'}>
      {marketStats.market.closed && (
        <Text
          p={'2px 6px'}
          bg={'red'}
          color={'white'}
          pos={'absolute'}
          top={'-12px'}
          left={'6px'}
          borderRadius={'5px'}
          fontWeight={'bold'}
          zIndex={2}
        >
          Ended
          {/* : Lose */}
        </Text>
      )}
      <MarketCard
        marketAddress={marketStats.market.id}
        filter={marketStats.market.closed ? 'blur(4px)' : 'none'}
        {...props}
      >
        <Stack spacing={4} w={'full'} justifyContent={'space-between'}>
          <HStack w={'full'} justifyContent={'space-between'} lineHeight={'18px'}>
            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                {marketStats.outcomeTokenId == 0 ? (
                  <FaArrowUp size={'15px'} fill={colors.fontLight} />
                ) : (
                  <FaArrowDown size={'15px'} fill={colors.fontLight} />
                )}
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Outcome</Text>
                <Text fontWeight={'bold'}>
                  {market?.outcomeTokens[marketStats.outcomeTokenId ?? 0] ??
                    ['Yes', 'No'][marketStats.outcomeTokenId ?? 0]}{' '}
                  {NumberUtil.toFixed(marketStats.latestTrade?.outcomePercent, 3)}{' '}
                  {collateralToken.symbol}
                </Text>
              </Stack>
            </HStack>

            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                <FaFileInvoiceDollar size={'15px'} fill={colors.fontLight} />
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Bet</Text>
                <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(
                  marketStats.collateralAmount,
                  6
                )} ${collateralToken.symbol}`}</Text>
              </Stack>
            </HStack>

            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                <FaTrophy size={'15px'} fill={colors.fontLight} />
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Max win</Text>
                <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(
                  marketStats.outcomeTokenAmount,
                  6
                )} ${collateralToken.symbol}`}</Text>
              </Stack>
            </HStack>
          </HStack>

          <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} />
        </Stack>
      </MarketCard>
    </Flex>
  )
}
