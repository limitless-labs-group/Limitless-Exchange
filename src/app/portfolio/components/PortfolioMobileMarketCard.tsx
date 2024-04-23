import { collateralToken, defaultChain, markets } from '@/constants'
import { createPortfolioShareUrls, HistoryMarketStats } from '@/services'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Box, Flex, HStack, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { MobileMarketCard } from '@/components/markets/MobileMarketCard'
import { usePriceOracle } from '@/providers'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'

interface IPortfolioMarketCard extends StackProps {
  marketStats: HistoryMarketStats
}

export const PortfolioMobileMarketCard = ({ marketStats, ...props }: IPortfolioMarketCard) => {
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

  const { convertEthToUsd } = usePriceOracle()

  const getOutcomeNotation = () => {
    const outcomeTokenId = marketStats.outcomeTokenId ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return market?.outcomeTokens[outcomeTokenId] ?? defaultOutcomes[outcomeTokenId]
  }

  return (
    <Flex>
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
      <MobileMarketCard
        marketAddress={marketStats.market.id}
        filter={marketStats.market.closed ? 'blur(4px)' : 'none'}
        {...props}
      >
        <Stack spacing={4} mb={3}>
          <VStack w={'full'} lineHeight={'18px'}>
            {/* Outcome Row */}
            <HStack w='full' justifyContent='space-between'>
              <Text color='fontLight' justifyContent='start' ml={2}>
                Outcome
              </Text>
              <HStack mr={2} color={getOutcomeNotation() === 'Yes' ? '#48CB9A' : '#EF5D5D'}>
                <Text>
                  {getOutcomeNotation()}&nbsp;
                  {`${NumberUtil.toFixed(marketStats.latestTrade?.outcomePercent, 3)} ${
                    collateralToken.symbol
                  }`}
                </Text>
              </HStack>
            </HStack>

            {/* Bet Row */}
            <HStack w='full' justifyContent='space-between'>
              <Text color='fontLight' ml={2}>
                Bet
              </Text>

              <HStack mr={2}>
                <Text fontFamily='Inter'>
                  {`${NumberUtil.toFixed(marketStats.collateralAmount, 4)} ${
                    collateralToken.symbol
                  }`}
                </Text>

                <Text fontSize='12px' color='#8E8E8E'>
                  ~{NumberUtil.toFixed(convertEthToUsd(marketStats.collateralAmount), 2)}
                </Text>
              </HStack>
            </HStack>

            {/* Max win Row */}
            <HStack w='full' justifyContent='space-between'>
              <Text color={'fontLight'} ml={2}>
                Max win
              </Text>
              <HStack mr={2}>
                <Text>{`${NumberUtil.toFixed(marketStats.outcomeTokenAmount, 4)} ${
                  collateralToken.symbol
                }`}</Text>

                <Text fontSize='12px' color='#8E8E8E'>
                  ~{NumberUtil.toFixed(convertEthToUsd(marketStats.outcomeTokenAmount), 2)}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Stack>
        <Box mb={2}>
          <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} />
        </Box>
      </MobileMarketCard>
    </Flex>
  )
}
