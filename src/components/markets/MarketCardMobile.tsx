import { collateralToken, defaultChain, markets } from '@/constants'
import { useMarketData } from '@/hooks'
import { borderRadius, colors } from '@/styles'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'
import { HStack, Stack, StackProps, Text, Divider, Avatar } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FaCircle } from 'react-icons/fa'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'
import { createMarketShareUrls } from '@/services'

interface IMarketCard extends StackProps {
  marketAddress?: Address
}

export const MarketCardMobile = ({ marketAddress, children, ...props }: IMarketCard) => {
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
      backgroundColor={'bgLight'}
      transition={'0.2s'}
      spacing={0}
      p={3}
      _hover={{ filter: 'none' }}
      {...props}
    >
      <Stack w={'full'} spacing={3}>
        <HStack w={'full'} spacing={3}>
          <Avatar src={market?.imageURI} size={'lg'} onClick={() => router.push(marketURI)} />

          <Stack alignItems={'start'}>
            <Text fontWeight={'bold'} fontSize={'16px'} noOfLines={2} lineHeight={'18px'}>
              {market?.title ?? 'Noname market'}
            </Text>

            <HStack
              fontSize={'12px'}
              color={'fontLight'}
              justifyContent={'space-between'}
              divider={<FaCircle size={'3px'} />}
              gap={2}
              fontWeight={'bold'}
            >
              <Text>{market?.expirationData}</Text>
              <Text>{`${NumberUtil.toFixed(liquidity, 4)} ${collateralToken.symbol}`}</Text>
              <Text>{holdersCount ?? 0} investors</Text>
            </HStack>
          </Stack>
        </HStack>

        <Divider borderColor={'border'} />

        {children ?? <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} />}
      </Stack>
    </Stack>
  )
}
