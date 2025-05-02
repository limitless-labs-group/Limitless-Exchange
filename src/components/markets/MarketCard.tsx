import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'
import { defaultChain } from '@/constants'
import { useMarketData } from '@/hooks'
import { useToken } from '@/hooks/use-token'
import { createMarketShareUrls } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { mockMarkets } from '@/services/mock-markets'
import { borderRadius, colors } from '@/styles'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Divider, Heading, HStack, Image, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { formatUnits, parseUnits } from 'viem'

interface IMarketCard extends StackProps {
  marketAddress?: Address
}

export const MarketCard = ({ marketAddress, ...props }: IMarketCard) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()
  // const market = useMarket(marketAddress as string)
  const market = mockMarkets.data.find(
    (market) => market.address[defaultChain.id] === marketAddress
  )
  // const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])
  // const { outcomeTokensPercent, liquidity, volume } = useMarketData({
  //   marketAddress,
  //   collateralToken,
  // })

  const volume = formatUnits(BigInt(market?.volume || '0'), 6)
  const liquidity = formatUnits(BigInt(market?.liquidity || '0'), 6)

  const chancePercent = market?.outcomeTokensPercent[0]

  /**
   * SHARE
   */
  const marketURI = `${window.location.origin}/markets/${marketAddress}`
  const shareLinks = createMarketShareUrls(market as Market, market?.outcomeTokensPercent)

  console.log(market)

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
          <Text>{chancePercent}% chance</Text>
        </Stack>
      </Stack>

      <Divider />

      <VStack alignItems={'start'} spacing={1} pt={4} w={'full'}>
        <HStack w={'full'} justifyContent={'space-between'}>
          <Text>Token</Text>
          <HStack>
            <Image
              src={market?.tokenURI[defaultChain.id]}
              alt='token'
              width={'20px'}
              height={'20px'}
              rounded={'full'}
            />
            <Text>{market?.tokenTicker[defaultChain.id]}</Text>
          </HStack>
        </HStack>

        <HStack w={'full'} justifyContent={'space-between'}>
          <Text>Deadline</Text>
          <Text>{market?.expirationDate}</Text>
        </HStack>

        <HStack w={'full'} justifyContent={'space-between'}>
          <Text>Pool</Text>
          <HStack>
            <Text>
              {NumberUtil.formatThousands(liquidity, 4)} {market?.tokenTicker[defaultChain.id]}
            </Text>
          </HStack>
        </HStack>

        <HStack w={'full'} justifyContent={'space-between'} mb={5}>
          <Text>Volume</Text>
          <HStack>
            <Text>
              {NumberUtil.formatThousands(volume, 4)} {market?.tokenTicker[defaultChain.id]}
            </Text>
          </HStack>
        </HStack>

        <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} w={'full'} />
      </VStack>
    </Stack>
  )
}
