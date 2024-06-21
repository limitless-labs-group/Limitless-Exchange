import { defaultChain } from '@/constants'
import { useMarketData } from '@/hooks'
import { borderRadius, colors } from '@/styles'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'
import { HStack, Stack, StackProps, Text, Avatar } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'
import { createMarketShareUrls } from '@/services'
import { useToken } from '@/hooks/use-token'

interface IMarketCard extends StackProps {
  market: Market
}

export const MarketCardMobile = ({ market, children, ...props }: IMarketCard) => {
  const router = useRouter()
  const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])
  const { liquidity, volume } = useMarketData({
    marketAddress: market.address[defaultChain.id],
    collateralToken,
  })

  const marketURI = `${window.location.origin}/markets/${market.address[defaultChain.id]}`

  const shareLinks = createMarketShareUrls(market, market.prices)

  const yesPercent = useMemo(() => {
    return market.prices[0].toFixed(1)
  }, [market])

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
