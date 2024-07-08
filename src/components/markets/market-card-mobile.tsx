import { defaultChain } from '@/constants'
import { useMarketData } from '@/hooks'
import { Address } from '@/types'
import { NumberUtil } from '@/utils'
import { HStack, Stack, StackProps, Text, Divider, Icon } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useMarket } from '@/services/MarketsService'
import { useToken } from '@/hooks/use-token'
import Paper from '@/components/common/paper'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'

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

  const yesPercent = useMemo(() => {
    return outcomeTokensPercent?.[market?.outcomeTokens[0] === 'Yes' ? 0 : 1].toFixed(1)
  }, [market, outcomeTokensPercent])

  return (
    <Paper
      justifyContent={'space-between'}
      onClick={() => router.push(marketURI)}
      w={'full'}
      {...props}
    >
      <Stack w={'full'} spacing={3}>
        <HStack w={'full'} spacing={3} onClick={() => router.push(marketURI)}>
          <Stack alignItems={'start'}>
            <Text
              fontWeight={'bold'}
              fontSize={'16px'}
              noOfLines={3}
              lineHeight={'18px'}
              textDecor={'underline'}
            >
              {market?.title ?? 'Noname market'}
            </Text>
            <HStack gap={1}>
              <ThumbsUpIcon width={'16px'} height={'16px'} />
              {!children && <Text>{yesPercent}% YES</Text>}
            </HStack>
            <HStack gap={1}>
              <Icon as={CalendarIcon} width={'16px'} height={'16px'} color={'grey.500'} />
              <Text color={'grey.500'} fontSize={'14px'}>
                {market?.expirationDate}
              </Text>
            </HStack>
          </Stack>
        </HStack>
        <Divider borderColor={'grey.400'} />
        <Stack>
          <HStack w={'full'} justifyContent={'space-between'}>
            <HStack gap={1}>
              <Icon as={LiquidityIcon} color={'grey.500'} width={'16px'} height={'16px'} />
              <Text color={'grey.500'} fontSize={'14px'}>
                Liquidity
              </Text>
            </HStack>

            <Text>{`${NumberUtil.formatThousands(liquidity, 4)} ${
              market?.tokenTicker[defaultChain.id]
            }`}</Text>
          </HStack>
          <HStack w={'full'} justifyContent={'space-between'}>
            <HStack gap={1}>
              <Icon as={VolumeIcon} color={'grey.500'} width={'16px'} height={'16px'} />
              <Text color={'grey.500'} fontSize={'14px'}>
                Volume
              </Text>
            </HStack>
            <Text>{`${NumberUtil.formatThousands(volume, 4)} ${
              market?.tokenTicker[defaultChain.id]
            }`}</Text>
          </HStack>
        </Stack>

        {children}
      </Stack>
    </Paper>
  )
}
