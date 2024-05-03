import { collateralToken, defaultChain, markets } from '@/constants'
import { createPortfolioShareUrls } from '@/services'
import { NumberUtil } from '@/utils'
import { Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { usePriceOracle } from '@/providers'
import { Button, MarketCardMobile, MarketCardUserActions } from '@/components'
import { IPortfolioPositionCard } from '@/app/portfolio/components'
import { useRouter } from 'next/navigation'

export const PortfolioPositionCardMobile = ({ position, ...props }: IPortfolioPositionCard) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()

  const market = useMemo(
    () =>
      markets.find(
        (market) =>
          market.address[defaultChain.id]?.toLowerCase() === position.market.id.toLowerCase()
      ) ?? null,
    [position, markets]
  )

  const marketURI = `${window.location.origin}/markets/${position.market.id}`

  const shareLinks = createPortfolioShareUrls(market, position)

  const { convertEthToUsd } = usePriceOracle()

  const getOutcomeNotation = () => {
    const outcomeTokenId = position.outcomeIndex ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return market?.outcomeTokens[outcomeTokenId] ?? defaultOutcomes[outcomeTokenId]
  }

  return (
    <Flex>
      {position.market.closed && (
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
        marketAddress={position.market.id}
        filter={position.market.closed ? 'blur(4px)' : 'none'}
        {...props}
      >
        <Stack w={'full'} spacing={3} mt={1}>
          <Stack w={'full'} lineHeight={'18px'}>
            {/* Outcome Row */}
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Outcome</Text>

              <Text color={getOutcomeNotation() === 'Yes' ? 'green' : 'red'}>
                {`${getOutcomeNotation()} ${NumberUtil.toFixed(
                  position.latestTrade?.outcomeTokenPrice,
                  3
                )} ${collateralToken.symbol}`}
              </Text>
            </HStack>

            {/* Bet Row */}
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Bet</Text>

              <HStack>
                <Text>
                  {`${NumberUtil.toFixed(position.collateralAmount, 4)} ${collateralToken.symbol}`}
                </Text>

                <Text fontSize={'12px'} color={'fontLight'}>
                  ~${NumberUtil.toFixed(convertEthToUsd(position.collateralAmount), 2)}
                </Text>
              </HStack>
            </HStack>

            {/* Max win Row */}
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Max win</Text>

              <HStack>
                <Text>{`${NumberUtil.toFixed(position.outcomeTokenAmount, 4)} ${
                  collateralToken.symbol
                }`}</Text>

                <Text fontSize={'12px'} color={'fontLight'}>
                  ~${NumberUtil.toFixed(convertEthToUsd(position.outcomeTokenAmount), 2)}
                </Text>
              </HStack>
            </HStack>
          </Stack>

          <MarketCardUserActions
            marketURI={marketURI}
            shareLinks={shareLinks}
            mainActionButton={(() => {
              if (market?.expired || window?.location.href.includes('?expired=true')) {
                return (
                  <Button
                    bg={'brand'}
                    color={'white'}
                    h={'full'}
                    w={'full'}
                    p={1}
                    onClick={() => router.push(marketURI)}
                  >
                    Claim winning
                  </Button>
                )
              }
              return undefined
            })()}
          />
        </Stack>
      </MarketCardMobile>
    </Flex>
  )
}
