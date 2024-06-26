import { defaultChain } from '@/constants'
import { useMarketData } from '@/hooks'
import { borderRadius, colors } from '@/styles'
import { Address } from '@/types'
import { NumberUtil } from '@/utils'
import { HStack, Stack, StackProps, Text, Avatar } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'
import { createMarketShareUrls } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { useToken } from '@/hooks/use-token'

interface IMarketCard extends StackProps {
  marketAddress?: Address
}

export const MarketCardMobile = ({ marketAddress, children, ...props }: IMarketCard) => {
  const router = useRouter()
  const market = useMarket(marketAddress as string)
  const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])
  const { outcomeTokensPercent, liquidity, volume } = useMarketData({
    marketAddress,
    collateralToken,
  })

  const marketURI = `${window.location.origin}/markets/${marketAddress}`

  const shareLinks = createMarketShareUrls(market, outcomeTokensPercent)

  const yesPercent = useMemo(() => {
    return outcomeTokensPercent?.[market?.outcomeTokens[0] === 'Yes' ? 0 : 1].toFixed(1)
  }, [market, outcomeTokensPercent])

  return (
    <Stack
      w={'full'}
      border={`1px solid ${colors.border}`}
      borderRadius={borderRadius}
      backgroundColor={'bgLight'}
      transition={'0.2s'}
      spacing={0}
      p={3}
      pt={4}
      _hover={{ filter: 'none' }}
      {...props}
    >
      <Stack w={'full'} spacing={3}>
        <HStack w={'full'} spacing={3} onClick={() => router.push(marketURI)}>
          <Avatar src={market?.placeholderURI} size={'lg'} />

          <Stack alignItems={'start'}>
            <Text fontWeight={'bold'} fontSize={'16px'} noOfLines={3} lineHeight={'18px'}>
              {market?.title ?? 'Noname market'}
            </Text>

            {!children && <Text>{yesPercent}% chance</Text>}
          </Stack>
        </HStack>

        <Stack>
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Deadline</Text>
            <Text fontWeight={'bold'}>{market?.expirationDate}</Text>
          </HStack>
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Liquidity</Text>
            <Text fontWeight={'bold'}>{`${NumberUtil.formatThousands(liquidity, 4)} ${
              market?.tokenTicker[defaultChain.id]
            }`}</Text>
          </HStack>
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Volume</Text>
            <Text fontWeight={'bold'}>{`${NumberUtil.formatThousands(volume, 4)} ${
              market?.tokenTicker[defaultChain.id]
            }`}</Text>
          </HStack>
        </Stack>

        {children ?? <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} />}
      </Stack>
    </Stack>
  )
}
