import { defaultChain } from '@/constants'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Box, Heading, HStack, StackProps, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Paper from '@/components/common/paper'
import { Icon } from '@chakra-ui/react'

interface IMarketCard extends StackProps {
  market: Market
}

export const MarketCard = ({ market, ...props }: IMarketCard) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()

  /**
   * SHARE
   */
  const marketURI = `${window.location.origin}/markets/${market.address[defaultChain.id]}`

  return (
    <Paper
      w={'full'}
      justifyContent={'space-between'}
      onClick={() => router.push(marketURI)}
      cursor='pointer'
      {...props}
    >
      <HStack justifyContent='space-between' mb='12px'>
        <Text color={'black'} fontSize={'14px'} lineHeight={'20px'} textDecor={'underline'}>
          {market?.title ?? 'Noname market'}
        </Text>
        <HStack gap={1}>
          <ThumbsUpIcon width={'16px'} height={'16px'} />
          <Heading color={'black'} lineHeight={'20px'} fontSize={'14px'}>
            {market?.buyYesNo[0]}% YES
          </Heading>
          <ArrowRightIcon width={'16px'} height={'16px'} />
        </HStack>
      </HStack>
      <HStack justifyContent='space-between' alignItems='flex-end'>
        <HStack gap='24px'>
          <Box>
            <HStack gap={1}>
              <Icon as={LiquidityIcon} color={'grey.500'} width={'16px'} height={'16px'} />
              <Text color={'grey.500'} fontSize={'14px'} fontWeight={'bold'}>
                Liquidity
              </Text>
            </HStack>
            <Text mt={1}>
              {NumberUtil.formatThousands(market?.liquidityFormatted, 4)}{' '}
              {market?.tokenTicker[defaultChain.id]}
            </Text>
          </Box>
          <Box>
            <HStack gap={1}>
              <Icon as={VolumeIcon} color={'grey.500'} width={'16px'} height={'16px'} />
              <Text color={'grey.500'} fontSize={'14px'} fontWeight={'bold'}>
                Volume
              </Text>
            </HStack>
            <Text mt={1}>
              {NumberUtil.formatThousands(market?.volumeFormatted, 4)}{' '}
              {market?.tokenTicker[defaultChain.id]}
            </Text>
          </Box>
        </HStack>
        <HStack gap={1}>
          <CalendarIcon width={'16px'} height={'16px'} />
          <Text color={'grey.500'} fontSize={'14px'}>
            {market?.expirationDate}
          </Text>
        </HStack>
      </HStack>
    </Paper>
  )
}
