import { Button } from '@/components'
import { collateralToken, defaultChain, markets } from '@/constants'
import { useMarketData } from '@/hooks'
import { createMarketShareUrls } from '@/services'
import { borderRadius, colors } from '@/styles'
import { Address, Market } from '@/types'
import { NumberUtil } from '@/utils'
import { HStack, Heading, Image, Stack, StackProps, Text, useClipboard } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FaLink, FaXTwitter } from 'react-icons/fa6'

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

  const { outcomeTokensPercent, liquidity, holdersCount } = useMarketData({ marketAddress })

  const marketURI = `${window.location.origin}/markets/${marketAddress}`

  const { tweetURI, castURI } = createMarketShareUrls(market, outcomeTokensPercent)

  const { onCopy, hasCopied } = useClipboard(marketURI)

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
        src={market?.imageURI}
        w={{ sm: 'full' }}
        h={{ sm: '200px', md: '150px' }}
        fit={'cover'}
        bg={'brand'}
        borderRadius={borderRadius}
        borderEndStartRadius={0}
        borderEndEndRadius={0}
        onClick={() => router.push(marketURI)}
      />

      <Stack alignItems={'start'} p={3}>
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
          lineHeight={'24px'}
          _hover={{ textDecor: 'underline' }}
          onClick={() => router.push(marketURI)}
        >
          {market?.title ?? 'Noname market'}
        </Heading>

        <HStack w={'full'} spacing={4}>
          <HStack>
            <Text color={'fontLight'}>Bets</Text>
            <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(liquidity, 4)} ${
              collateralToken.symbol
            }`}</Text>
          </HStack>
          <HStack>
            <Text color={'fontLight'}>Investors</Text>
            <Text fontWeight={'bold'}>{holdersCount ?? 0}</Text>
          </HStack>
          <HStack>
            <Text color={'fontLight'}>Deadline</Text>
            <Text noOfLines={1} fontWeight={'bold'}>
              {market?.expirationData}
            </Text>
          </HStack>
        </HStack>

        {children ?? (
          <Stack w={'full'}>
            <HStack h={'33px'}>
              <Button
                bg={'black'}
                color={'white'}
                h={'full'}
                w={'full'}
                p={1}
                onClick={() => router.push(marketURI)}
              >
                Trade
              </Button>
              <Button h={'full'} aspectRatio={'1/1'} p={1} onClick={onCopy}>
                <FaLink size={'16px'} fill={hasCopied ? colors.brand : colors.font} />
              </Button>
              <Button
                h={'full'}
                aspectRatio={'1/1'}
                p={1}
                onClick={() => window.open(tweetURI, '_blank')}
              >
                <FaXTwitter size={'16px'} />
              </Button>
              <Button
                h={'full'}
                aspectRatio={'1/1'}
                p={1}
                onClick={() => window.open(castURI, '_blank')}
              >
                <Image src='/assets/images/farcaster.png' h={'full'} />
              </Button>
            </HStack>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
