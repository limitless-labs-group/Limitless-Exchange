import { Button, MarketCard } from '@/components'
import { defaultChain, markets } from '@/constants'
import { HistoryMarketStats } from '@/services'
import { borderRadius, colors } from '@/styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { Flex, HStack, Stack, StackProps, Text, useClipboard } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FaArrowDown } from 'react-icons/fa'
import { FaDollarSign, FaLink, FaSackDollar, FaXTwitter } from 'react-icons/fa6'

interface IPortfolioMarketCard extends StackProps {
  marketStats: HistoryMarketStats
}

export const PortfolioMarketCard = ({ marketStats, children, ...props }: IPortfolioMarketCard) => {
  const market: Market | null = useMemo(
    () =>
      markets.find(
        (market) =>
          market.address[defaultChain.id]?.toLowerCase() === marketStats.market.id.toLowerCase()
      ) ?? null,
    [marketStats, markets]
  )

  const router = useRouter()
  const marketURI = `${window.location.origin}/markets/${marketStats.market.id}`
  const { onCopy, hasCopied } = useClipboard(marketURI)

  const tweetURI = encodeURI(
    `https://x.com/intent/tweet?text="${market?.title}" by ${
      market?.creator.name
    }\nMy bet: $${NumberUtil.toFixed(marketStats.investedUsd, 2)} for ${
      market?.outcomeTokens[marketStats.outcomeId ?? 0]
    }\nMake yours on ${marketURI}`
  )

  return (
    <Flex pos={'relative'}>
      {marketStats.market.closed && (
        <Text
          p={'2px 6px'}
          bg={'red'}
          color={'white'}
          pos={'absolute'}
          top={'-12px'}
          left={'6px'}
          borderRadius={'5px'}
          fontWeight={'bold'}
          zIndex={2}
        >
          Ended
          {/* : Lose */}
        </Text>
      )}
      <MarketCard
        marketAddress={marketStats.market.id}
        filter={marketStats.market.closed ? 'blur(4px)' : 'none'}
        {...props}
      >
        <Stack spacing={4} w={'full'} justifyContent={'space-between'}>
          {/* <HStack>
            <Text
              p={'2px 6px'}
              bg={marketStats.outcomeId == 0 ? 'green' : 'red'}
              color={'white'}
              fontWeight={'bold'}
              borderRadius={'6px'}
            >
              {market?.outcomeTokens[marketStats.outcomeId ?? 0]}{' '}
              {NumberUtil.toFixed(marketStats.latestTrade?.costPerShare, 2)}¢
            </Text>
            <HStack spacing={1}>
              <Text>Bet:</Text>
              <Text fontWeight={'bold'}>${NumberUtil.toFixed(marketStats.investedUsd, 2)}</Text>
            </HStack>
          </HStack>
          <HStack>
            <HStack spacing={1}>
              <Text>Shares:</Text>
              <Text color={'brand'} fontWeight={'bold'}>
                {NumberUtil.toFixed(marketStats.sharesAmount, 2)}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Text>To win:</Text>
              <Text color={'white'} fontWeight={'bold'}>
                ${NumberUtil.toFixed(marketStats.sharesAmount, 2)}
              </Text>
            </HStack>
          </HStack> */}

          <HStack w={'full'} justifyContent={'space-between'} lineHeight={'18px'}>
            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                <FaArrowDown size={'15px'} />
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Outcome</Text>
                <Text fontWeight={'bold'} color={marketStats.outcomeId == 0 ? 'green' : 'red'}>
                  {market?.outcomeTokens[marketStats.outcomeId ?? 0] ??
                    ['Yes', 'No'][marketStats.outcomeId ?? 0]}{' '}
                  {NumberUtil.toFixed(marketStats.latestTrade?.costPerShare, 1)}¢
                </Text>
              </Stack>
            </HStack>

            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                <FaDollarSign size={'15px'} />
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Bet</Text>
                <Text fontWeight={'bold'}>${NumberUtil.toFixed(marketStats.investedUsd, 2)}</Text>
              </Stack>
            </HStack>

            <HStack spacing={1}>
              <Flex p={2} bg={'bgLight'} borderRadius={borderRadius}>
                <FaSackDollar size={'15px'} />
              </Flex>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Max win</Text>
                <Text fontWeight={'bold'} color={'green'}>
                  ${NumberUtil.toFixed(marketStats.sharesAmount, 2)}
                </Text>
              </Stack>
            </HStack>
          </HStack>

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
          </HStack>
        </Stack>
      </MarketCard>
    </Flex>
  )
}
