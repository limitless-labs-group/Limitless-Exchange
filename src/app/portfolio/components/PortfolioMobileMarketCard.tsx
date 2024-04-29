import { collateralToken, defaultChain, markets } from '@/constants'
import { createPortfolioShareUrls, HistoryMarketStats } from '@/services'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Flex, HStack, Stack, StackProps, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { usePriceOracle } from '@/providers'
import { MarketCardMobile, MarketCardUserActions } from '@/components'

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
      <MarketCardMobile
        marketAddress={marketStats.market.id}
        filter={marketStats.market.closed ? 'blur(4px)' : 'none'}
        {...props}
      >
        <Stack w={'full'} spacing={3} mt={1}>
          <Stack w={'full'} lineHeight={'18px'}>
            {/* Outcome Row */}
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Outcome</Text>

              <Text color={getOutcomeNotation() === 'Yes' ? 'green' : 'red'}>
                {`${getOutcomeNotation()} ${NumberUtil.toFixed(
                  marketStats.latestTrade?.outcomePercent,
                  3
                )} ${collateralToken.symbol}`}
              </Text>
            </HStack>

            {/* Bet Row */}
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Bet</Text>

              <HStack>
                <Text>
                  {`${NumberUtil.toFixed(marketStats.collateralAmount, 4)} ${
                    collateralToken.symbol
                  }`}
                </Text>

                <Text fontSize={'12px'} color={'fontLight'}>
                  ~${NumberUtil.toFixed(convertEthToUsd(marketStats.collateralAmount), 2)}
                </Text>
              </HStack>
            </HStack>

            {/* Max win Row */}
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Max win</Text>

              <HStack>
                <Text>{`${NumberUtil.toFixed(marketStats.outcomeTokenAmount, 4)} ${
                  collateralToken.symbol
                }`}</Text>

                <Text fontSize={'12px'} color={'fontLight'}>
                  ~${NumberUtil.toFixed(convertEthToUsd(marketStats.outcomeTokenAmount), 2)}
                </Text>
              </HStack>
            </HStack>
          </Stack>

          <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} />
        </Stack>
      </MarketCardMobile>
    </Flex>
  )
}
