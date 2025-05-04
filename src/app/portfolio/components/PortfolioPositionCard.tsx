import { Button, MarketCardUserActions } from '@/components'
import { defaultChain } from '@/constants'
import { createPortfolioShareUrls, HistoryPosition } from '@/services'
import { NumberUtil } from '@/utils'
import { HStack, Heading, Image, Stack, StackProps, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { usePriceOracle } from '@/providers'
import { borderRadius, colors } from '@/styles'
import { useIsMobile } from '@/hooks'
import { FaCircle } from 'react-icons/fa'
import { mockMarkets } from '@/services/mock-markets'
import { formatUnits } from 'viem'
import { Market } from '@/types'

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
  // const market = useMarket(position.market.id)
  // const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])
  // const { outcomeTokensPercent, volume } = useMarketData({
  //   marketAddress: position.market.id,
  //   collateralToken,
  // })

  const market = mockMarkets.data.find(
    (market) => market.address[defaultChain.id] === position.market.id
  )

  // const chancePercent = useMemo(() => {
  //   if (market?.expired) {
  //     return market?.winningOutcomeIndex === 0 ? '100' : '0'
  //   }
  //   return outcomeTokensPercent?.[market?.outcomeTokens[0] === 'Yes' ? 0 : 1].toFixed(1)
  // }, [market, outcomeTokensPercent])

  const volume = formatUnits(BigInt(market?.volume || 0), 6)

  const chancePercent = market?.outcomeTokensPercent[0]

  /**
   * SHARE
   */
  const marketURI = `${window.location.origin}/markets/${position.market.id}`
  const shareLinks = createPortfolioShareUrls(market as Market, position)

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
          minW={'50px'}
          borderRadius={'full'}
          alt={'logo'}
          bg={'brand'}
          objectFit='cover'
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
                {NumberUtil.formatThousands(volume, 6)} {market?.tokenTicker[defaultChain.id]}
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
              <Image
                src={market?.tokenURI[defaultChain.id]}
                alt={'token'}
                width={'20px'}
                height={'20px'}
                rounded={'full'}
              />
              <Text>{market?.tokenTicker[defaultChain.id]}</Text>
            </HStack>
          </HStack>

          {/* Bet Row */}
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Bet</Text>

            <HStack>
              <Text>
                {`${NumberUtil.formatThousands(position.collateralAmount, 4)} ${
                  market?.tokenTicker[defaultChain.id]
                }`}
              </Text>

              <Text fontSize={'12px'} color={'fontLight'}>
                ~$
                {NumberUtil.formatThousands(
                  convertTokenAmountToUsd(
                    market?.tokenTicker[defaultChain.id],
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
              )} ${market?.tokenTicker[defaultChain.id]}`}
            </Text>
          </HStack>

          {/* Max win Row */}
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Max win</Text>

            <HStack>
              <Text>{`${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} ${
                market?.tokenTicker[defaultChain.id]
              }`}</Text>

              <Text fontSize={'12px'} color={'fontLight'}>
                ~$
                {NumberUtil.formatThousands(
                  convertTokenAmountToUsd(
                    market?.tokenTicker[defaultChain.id],
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
