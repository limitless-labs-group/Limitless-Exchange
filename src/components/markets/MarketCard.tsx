import { defaultChain, markets } from '@/constants'
import { useMarketData } from '@/hooks'
import { createMarketShareUrls } from '@/services'
import { borderRadius, colors } from '@/styles'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Divider, Heading, HStack, Image, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'

interface IMarketCard extends StackProps {
  marketAddress?: Address
}

export const MarketCard = ({ marketAddress, children, ...props }: IMarketCard) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()

  /**
   * MARKET DATA
   */
  const market: Market | null = useMemo(
    () =>
      markets.find(
        (market) =>
          market.address[defaultChain.id]?.toLowerCase() === marketAddress?.toLocaleLowerCase()
      ) ?? null,
    [marketAddress]
  )

  const { outcomeTokensPercent, liquidity, volume } = useMarketData({ marketAddress })

  const chancePercent = useMemo(() => {
    return outcomeTokensPercent?.[market?.outcomeTokens[0] === 'Yes' ? 0 : 1].toFixed(1)
  }, [market, outcomeTokensPercent])

  /**
   * SHARE
   */
  const marketURI = `${window.location.origin}/markets/${marketAddress}`
  const shareLinks = createMarketShareUrls(market, outcomeTokensPercent)

  return (
    <Stack
      w={'full'}
      border={`1px solid ${colors.border}`}
      borderRadius={borderRadius}
      transition={'0.2s'}
      p={4}
      _hover={{ filter: 'none' }}
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
          <Text>{chancePercent}% chance</Text>
        </Stack>
      </Stack>

      <Divider />

      <VStack alignItems={'start'} spacing={1} pt={4} w={'full'}>
        <HStack w={'full'} justifyContent={'space-between'}>
          <Text>Token</Text>
          <HStack>
            <Image src={market?.tokenURI} alt='token' width={'20px'} height={'20px'} />
            <Text>{market?.tokenTicker}</Text>
          </HStack>
        </HStack>

        <HStack w={'full'} justifyContent={'space-between'}>
          <Text>Deadline</Text>
          <Text>{market?.expirationDate}</Text>
        </HStack>

        <HStack w={'full'} justifyContent={'space-between'}>
          <Text>Pool</Text>
          <Text>
            {NumberUtil.formatThousands(liquidity, 4)} {market?.tokenTicker}
          </Text>
        </HStack>

        <HStack w={'full'} justifyContent={'space-between'} mb={5}>
          <Text>Volume</Text>
          <Text>
            {NumberUtil.formatThousands(volume, 4)} {market?.tokenTicker}
          </Text>
        </HStack>

        <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} w={'full'} />
      </VStack>
    </Stack>
  )
}
