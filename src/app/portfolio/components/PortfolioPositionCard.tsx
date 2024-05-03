import { Button, MarketCard } from '@/components'
import { collateralToken, defaultChain, markets } from '@/constants'
import { createPortfolioShareUrls, HistoryPosition } from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import { Flex, HStack, Stack, StackProps, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import { FaFileInvoiceDollar, FaTrophy } from 'react-icons/fa6'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'
import { useRouter } from 'next/navigation'

export interface IPortfolioPositionCard extends Omit<StackProps, 'position'> {
  position: HistoryPosition
}

export const PortfolioPositionCard = ({ position, ...props }: IPortfolioPositionCard) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()

  /**
   * MARKET DATA
   */
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
      <MarketCard
        marketAddress={position.market.id}
        filter={position.market.closed ? 'blur(4px)' : 'none'}
        {...props}
      >
        <Stack spacing={4} w={'full'} justifyContent={'space-between'}>
          <HStack w={'full'} justifyContent={'space-between'} lineHeight={'18px'}>
            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                {position.outcomeIndex == 0 ? (
                  <FaArrowUp size={'15px'} fill={colors.fontLight} />
                ) : (
                  <FaArrowDown size={'15px'} fill={colors.fontLight} />
                )}
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Outcome</Text>

                <Text color={getOutcomeNotation() === 'Yes' ? 'green' : 'red'}>
                  {`${getOutcomeNotation()} ${NumberUtil.toFixed(
                    position.latestTrade?.outcomeTokenPrice,
                    3
                  )} ${collateralToken.symbol}`}
                </Text>
              </Stack>
            </HStack>

            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                <FaFileInvoiceDollar size={'15px'} fill={colors.fontLight} />
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Bet</Text>
                <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(position.collateralAmount, 6)} ${
                  collateralToken.symbol
                }`}</Text>
              </Stack>
            </HStack>

            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                <FaTrophy size={'15px'} fill={colors.fontLight} />
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Max win</Text>
                <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} ${
                  collateralToken.symbol
                }`}</Text>
              </Stack>
            </HStack>
          </HStack>

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
      </MarketCard>
    </Flex>
  )
}
