import { Button, MarketCardUserActions } from '@/components'
import { defaultChain, markets } from '@/constants'
import { createPortfolioShareUrls, HistoryPosition } from '@/services'
import { NumberUtil } from '@/utils'
import { HStack, Heading, Image, Stack, StackProps, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { usePriceOracle } from '@/providers'
import { borderRadius, colors } from '@/styles'
import { useIsMobile, useMarketData } from '@/hooks'
import { FaCircle } from 'react-icons/fa'

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

  const { outcomeTokensPercent, volume } = useMarketData({ marketAddress: position.market.id })

  const chancePercent = useMemo(() => {
    return outcomeTokensPercent?.[market?.outcomeTokens[0] === 'Yes' ? 0 : 1].toFixed(1)
  }, [market, outcomeTokensPercent])

  /**
   * SHARE
   */
  const marketURI = `${window.location.origin}/markets/${position.market.id}`
  const shareLinks = createPortfolioShareUrls(market, position)

  /**
   * UTILS
   */
  const isMobile = useIsMobile()

  const { convertTokenAmountToUsd } = usePriceOracle()

  const getOutcomeNotation = () => {
    const outcomeTokenId = position.outcomeIndex ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return market?.outcomeTokens[outcomeTokenId] ?? defaultOutcomes[outcomeTokenId]
  }

  return (
    <Stack
      w={'full'}
      border={`1px solid ${colors.border}`}
      borderRadius={borderRadius}
      transition={'0.2s'}
      p={4}
      justifyContent={'space-between'}
      {...props}
    >
      <Stack direction='row' onClick={() => router.push(marketURI)}>
        <Image
          src={market?.placeholderURI}
          w='50px'
          h='50px'
          borderRadius={'full'}
          alt={'logo'}
          bg={'brand'}
        />
        <Stack spacing={1}>
          <Heading fontSize={'18px'} lineHeight={'20px'} _hover={{ textDecor: 'underline' }}>
            {market?.title ?? 'Noname market'}
          </Heading>

          <HStack
            color={'fontLight'}
            fontSize={'12px'}
            divider={<FaCircle size={'3px'} fill={'grey'} />}
            gap={2}
          >
            <Text>{market?.expirationDate}</Text>
            <Text>{chancePercent}% chance</Text>
            {!isMobile && (
              <Text>
                {volume} {position.market.collateral?.symbol}
              </Text>
            )}
          </HStack>
        </Stack>
      </Stack>

      <Stack w={'full'} spacing={3} mt={1}>
        <Stack w={'full'} lineHeight={'18px'}>
          {/* Token */}
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Token</Text>

            <HStack>
              <Image src={market?.tokenURI} alt={'token'} width={'20px'} height={'20px'} />
              <Text>{position.market.collateral?.symbol}</Text>
            </HStack>
          </HStack>

          {/* Bet Row */}
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Bet</Text>

            <HStack>
              <Text>
                {`${NumberUtil.formatThousands(position.collateralAmount, 4)} ${
                  position.market.collateral?.symbol
                }`}
              </Text>

              <Text fontSize={'12px'} color={'fontLight'}>
                ~$
                {NumberUtil.formatThousands(
                  convertTokenAmountToUsd(
                    position.market.collateral?.symbol,
                    position.collateralAmount
                  ),
                  2
                )}
              </Text>
            </HStack>
          </HStack>

          {/* Outcome Row */}
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Outcome</Text>

            <Text color={getOutcomeNotation() === 'Yes' ? 'green' : 'red'}>
              {`${getOutcomeNotation()} ${NumberUtil.formatThousands(
                position.latestTrade?.outcomeTokenPrice,
                3
              )} ${position.market.collateral?.symbol}`}
            </Text>
          </HStack>

          {/* Max win Row */}
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Max win</Text>

            <HStack>
              <Text>{`${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} ${
                position.market.collateral?.symbol
              }`}</Text>

              <Text fontSize={'12px'} color={'fontLight'}>
                ~$
                {NumberUtil.formatThousands(
                  convertTokenAmountToUsd(
                    position.market.collateral?.symbol,
                    position.outcomeTokenAmount
                  ),
                  2
                )}
              </Text>
            </HStack>
          </HStack>
        </Stack>

        <MarketCardUserActions
          marketURI={marketURI}
          shareLinks={shareLinks}
          mainActionButton={(() => {
            if (market?.expired) {
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
    </Stack>
  )
}
