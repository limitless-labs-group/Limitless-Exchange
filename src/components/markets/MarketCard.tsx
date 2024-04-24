import { collateralToken, defaultChain, markets } from '@/constants'
import { useMarketData } from '@/hooks'
import { createMarketShareUrls } from '@/services'
import { borderRadius, colors } from '@/styles'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Heading, HStack, Image, Stack, StackProps, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'

interface IMarketCard extends StackProps {
  marketAddress?: Address
}

export const MarketCard = ({ marketAddress, children, ...props }: IMarketCard) => {
  const router = useRouter()
  const market: Market | null = useMemo(
    () =>
      markets.find(
        (market) =>
          market.address[defaultChain.id]?.toLowerCase() === marketAddress?.toLocaleLowerCase()
      ) ?? null,
    [marketAddress]
  )

  const { outcomeTokensPercent, liquidity, holdersCount } = useMarketData({ marketAddress })

  const marketURI = `${window.location.origin}/markets/${marketAddress}`

  const shareLinks = createMarketShareUrls(market, outcomeTokensPercent)

  return (
    <Stack
      w={'full'}
      border={`1px solid ${colors.border}`}
      borderRadius={borderRadius}
      transition={'0.2s'}
      spacing={0}
      _hover={{ filter: 'none' }}
      {...props}
    >
      <Image
        src={market?.placeholderURI}
        w={{ sm: 'full' }}
        h={{ sm: '200px', md: '150px' }}
        fit={'cover'}
        bg={'brand'}
        borderRadius={borderRadius}
        borderEndStartRadius={0}
        borderEndEndRadius={0}
        onClick={() => router.push(marketURI)}
      />

      <Stack alignItems={'start'} p={4} spacing={3}>
        {!children && (
          <HStack textTransform={'uppercase'}>
            <Text color={'green'}>
              {market?.outcomeTokens[0] ?? 'Yes'} {(outcomeTokensPercent?.[0] ?? 50).toFixed(1)}%
            </Text>
            <Text color={'red'}>
              {market?.outcomeTokens[1] ?? 'No'} {(outcomeTokensPercent?.[1] ?? 50).toFixed(1)}%
            </Text>
          </HStack>
        )}

        <Stack w={'full'} spacing={3}>
          <Stack w={'full'}>
            <Heading
              fontSize={'18px'}
              lineHeight={'20px'}
              _hover={{ textDecor: 'underline' }}
              onClick={() => router.push(marketURI)}
            >
              {market?.title ?? 'Noname market'}
            </Heading>

            <HStack w={'full'} spacing={3} justifyContent={'space-between'}>
              <HStack>
                <Text color={'fontLight'}>Pool</Text>
                <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(liquidity, 4)} ${
                  collateralToken.symbol
                }`}</Text>
              </HStack>
              <HStack>
                <Text color={'fontLight'}>Investors</Text>
                <Text fontWeight={'bold'}>{holdersCount ?? 0}</Text>
              </HStack>
              <HStack>
                <Text color={'fontLight'}>Deadline</Text>
                <Text noOfLines={1} fontWeight={'bold'}>
                  {market?.expirationData}
                </Text>
              </HStack>
            </HStack>
          </Stack>

          {children ?? <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} />}
        </Stack>
      </Stack>
    </Stack>
  )
}
