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

  const { outcomeTokensPercent, liquidity, volume } = useMarketData({ marketAddress })

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
        // h={{ sm: '200px', md: '150px' }}
        aspectRatio={'3/1'}
        fit={'cover'}
        bg={'brand'}
        borderRadius={borderRadius}
        borderEndStartRadius={0}
        borderEndEndRadius={0}
        onClick={() => router.push(marketURI)}
      />

      <Stack
        alignItems={'start'}
        p={4}
        spacing={3}
        h={'full'}
        w={'full'}
        justifyContent={'space-between'}
      >
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

        <Heading
          fontSize={'18px'}
          lineHeight={'20px'}
          _hover={{ textDecor: 'underline' }}
          onClick={() => router.push(marketURI)}
        >
          {market?.title ?? 'Noname market'}
        </Heading>

        <HStack w={'full'} spacing={4} justifyContent={'space-between'}>
          <Stack spacing={0}>
            <Text color={'fontLight'}>Liquidity</Text>
            <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(liquidity, 4)} ${
              collateralToken.symbol
            }`}</Text>
          </Stack>

          <Stack spacing={0}>
            <Text color={'fontLight'}>Volume</Text>
            <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(volume, 4)} ${
              collateralToken.symbol
            }`}</Text>
          </Stack>

          <Stack spacing={0}>
            <Text color={'fontLight'}>Deadline</Text>
            <Text noOfLines={1} fontWeight={'bold'}>
              {market?.expirationDate}
            </Text>
          </Stack>
        </HStack>

        {children ?? (
          <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} w={'full'} />
        )}
      </Stack>
    </Stack>
  )
}
