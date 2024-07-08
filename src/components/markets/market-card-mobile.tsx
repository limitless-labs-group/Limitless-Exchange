import { defaultChain } from '@/constants'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { HStack, Stack, StackProps, Text, Divider, Icon } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Paper from '@/components/common/paper'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'

interface IMarketCard extends StackProps {
  market: Market
}

export const MarketCardMobile = ({ market, children, ...props }: IMarketCard) => {
  const router = useRouter()

  const marketURI = `${window.location.origin}/markets/${market.address[defaultChain.id]}`

  return (
    <Paper
      justifyContent={'space-between'}
      onClick={() => router.push(marketURI)}
      w={'full'}
      _hover={{ bg: 'grey.300', boxShadow: 'md' }}
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
              {!children && <Text>{market?.buyYesNo[0]}% YES</Text>}
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

            <Text>{`${NumberUtil.formatThousands(market.liquidityFormatted, 4)} ${
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
            <Text>{`${NumberUtil.formatThousands(market.volumeFormatted, 4)} ${
              market?.tokenTicker[defaultChain.id]
            }`}</Text>
          </HStack>
        </Stack>

        {children}
      </Stack>
    </Paper>
  )
}
