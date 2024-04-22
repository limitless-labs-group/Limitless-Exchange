import { collateralToken, defaultChain, markets } from '@/constants'
import { useMarketData } from '@/hooks'
import { borderRadius, colors } from '@/styles'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'
import { HStack, Stack, StackProps, Text, VStack, Divider } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { Avatar } from '@chakra-ui/react'
import { FaCircle } from 'react-icons/fa'
import { MarketCardUserActions } from '@/components/markets/MarketCardUserActions'
import { createMarketShareUrls } from '@/services'

interface IMarketCard extends StackProps {
  marketAddress?: Address
}

export const MobileMarketCard = ({ marketAddress, children, ...props }: IMarketCard) => {
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
      backgroundColor='#F7F9F9'
      transition={'0.2s'}
      spacing={0}
      _hover={{ filter: 'none' }}
      {...props}
    >
      <HStack>
        <Avatar
          src={market?.imageURI}
          size='lg'
          onClick={() => router.push(marketURI)}
          mt={2}
          ml={2}
        />

        <VStack align='start' p={1}>
          <Text fontWeight='bold' fontSize={'16px'} noOfLines={2}>
            {market?.title ?? 'Noname market'}
          </Text>

          <HStack
            mt={-2}
            fontSize={'12px'}
            color={'#747675'}
            justifyContent={'space-between'}
            divider={<FaCircle size='3px' />}
            gap={2}
          >
            <Text fontWeight='bold'>{market?.expirationData}, 2024</Text>
            <Text fontWeight='bold'>
              {`${NumberUtil.toFixed(liquidity, 4)} ${collateralToken.symbol}`}
            </Text>
            <Text fontWeight='bold'>{holdersCount ?? 0} investors</Text>
          </HStack>
        </VStack>
      </HStack>

      <Divider my={2} borderColor='gray.300' />

      {children ?? <MarketCardUserActions marketURI={marketURI} shareLinks={shareLinks} />}
    </Stack>
  )
}
