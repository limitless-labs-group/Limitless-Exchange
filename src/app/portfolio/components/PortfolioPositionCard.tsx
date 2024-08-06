import { defaultChain } from '@/constants'
import { ClickEvent, HistoryPosition, useAmplitude } from '@/services'
import { NumberUtil } from '@/utils'
import {
  HStack,
  Stack,
  StackProps,
  Text,
  Box,
  Icon,
  VStack,
  Divider,
  Button,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMarket } from '@/services/MarketsService'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ClosedIcon from '@/resources/icons/close-rounded-icon.svg'
import ActiveIcon from '@/resources/icons/active-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import WinIcon from '@/resources/icons/win-icon.svg'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import NextLink from 'next/link'

export interface IPortfolioPositionCard extends Omit<StackProps, 'position'> {
  position: HistoryPosition
}

const unhoveredColors = {
  main: 'grey.800',
  secondary: 'grey.500',
}

const hoverColors = {
  main: 'white',
  secondary: 'transparent.700',
}

export const PortfolioPositionCard = ({ position, ...props }: IPortfolioPositionCard) => {
  const [colors, setColors] = useState(unhoveredColors)

  const { trackClicked } = useAmplitude()

  /**
   * NAVIGATION
   */
  const router = useRouter()

  /**
   * MARKET DATA
   */
  const { data: market } = useMarket(position.market.id)

  const currentContractsPrice =
    +(position.outcomeTokenAmount || 1) * ((market?.prices[position.outcomeIndex] || 1) / 100)

  const contractPrice = currentContractsPrice / +(position?.collateralAmount || 1)

  const contractPriceChanged = useMemo(() => {
    let price
    if (contractPrice < 1) {
      price = NumberUtil.toFixed((1 - contractPrice) * 100, 0)
    } else {
      price = NumberUtil.toFixed((contractPrice - 1) * 100, 0)
    }
    if (contractPrice < 1) {
      return (
        <Text {...paragraphMedium} color={colors.main === 'white' ? 'white' : 'red.500'}>
          &#x2193;
          {price}%
        </Text>
      )
    }
    return (
      <Text {...paragraphMedium} color={colors.main === 'white' ? 'white' : 'green.500'}>
        &#x2191;
        {price}%
      </Text>
    )
  }, [contractPrice, colors.main])

  // const chancePercent = useMemo(() => {
  //   if (market?.expired) {
  //     return market?.winningOutcomeIndex === 0 ? '100' : '0'
  //   }
  //   return outcomeTokensPercent?.[market?.outcomeTokens[0] === 'Yes' ? 0 : 1].toFixed(1)
  // }, [market, outcomeTokensPercent])

  /**
   * SHARE
   */
  const marketURI = `${window.location.origin}/markets/${position.market.id}`

  const getOutcomeNotation = () => {
    const outcomeTokenId = position.outcomeIndex ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return market?.outcomeTokens[outcomeTokenId] ?? defaultOutcomes[outcomeTokenId]
  }

  const ClaimButton = () => {
    return (
      <Button
        variant='white'
        onClick={() => {
          trackClicked(ClickEvent.ClaimRewardOnPortfolioClicked, {
            platform: isMobile ? 'mobile' : 'desktop',
          })
          router.push(marketURI)
        }}
      >
        <Icon as={WinIcon} color={'black'} />
        Claim{' '}
        {`${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} ${
          market?.tokenTicker[defaultChain.id]
        }`}
      </Button>
    )
  }

  const cardColors = useMemo(() => {
    if (market?.expired) {
      return {
        main: 'white',
        secondary: isMobile ? 'white' : 'transparent.700',
      }
    }
    return {
      main: colors.main,
      secondary: colors.secondary,
    }
  }, [market, colors])

  //@ts-ignore
  const StatusIcon = ({ market }) =>
    market?.expired ? (
      <>
        <Icon as={ClosedIcon} width={'16px'} height={'16px'} color={cardColors.secondary} />
        <Text {...paragraphMedium} color={cardColors.secondary}>
          Closed
        </Text>
      </>
    ) : (
      <>
        <ActiveIcon width={16} height={16} />
        <Text {...paragraphMedium} color={cardColors.secondary}>
          Active
        </Text>
      </>
    )

  return isMobile ? (
    <Paper
      onClick={() => router.push(marketURI)}
      w={'full'}
      bg={market?.expired ? 'green.500' : 'grey.200'}
      p={'16px'}
      {...props}
    >
      <Stack spacing={'8px'}>
        <HStack w={'full'} spacing={1} justifyContent={'space-between'}>
          <Text {...paragraphMedium} color={cardColors.main}>
            {market?.proxyTitle ?? market?.title ?? 'Noname market'}
          </Text>
          <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={cardColors.main} />
        </HStack>
        <HStack>
          {market?.expired ? (
            <Text {...paragraphMedium} color={cardColors.main}>
              {`Won ${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} ${
                market?.tokenTicker[defaultChain.id]
              }`}
            </Text>
          ) : (
            <HStack>
              <Text fontSize={'16px'} lineHeight={'20px'} fontWeight={500}>
                {`${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} 
                    ${market?.tokenTicker[defaultChain.id]}`}
              </Text>
              <Box gap={0} fontSize={'16px'} fontWeight={500}>
                {contractPriceChanged}
              </Box>
            </HStack>
          )}
        </HStack>
        <HStack color={cardColors.secondary}>
          <HStack gap={1}>{<StatusIcon market={market} />}</HStack>
          <HStack gap={1} color={cardColors.secondary}>
            <CalendarIcon width={'16px'} height={'16px'} />
            <Text {...paragraphMedium} color={cardColors.secondary}>
              {market?.expirationDate}
            </Text>
          </HStack>
        </HStack>
        <HStack>{market?.expired && <ClaimButton />}</HStack>
      </Stack>

      <Divider w={'full'} bgColor={'grey.400'} h={'1px'} mb={'10px'} mt={'10px'} />

      <Stack w={'full'}>
        <HStack alignItems={'start'} gap={0} justifyContent={'space-between'}>
          <Text {...paragraphMedium} color={cardColors.secondary}>
            Position
          </Text>
          <Text color={cardColors.main} fontWeight={400} lineHeight={'20px'} fontSize={'16px'}>
            {getOutcomeNotation()}
          </Text>
        </HStack>
      </Stack>
      <Stack w={'full'} mt={'8px'}>
        <HStack alignItems={'start'} gap={0} justifyContent={'space-between'}>
          <Text {...paragraphMedium} color={cardColors.secondary}>
            Invested
          </Text>
          <Text color={cardColors.main} lineHeight={'20px'} fontWeight={400} fontSize={'16px'}>
            {`${NumberUtil.formatThousands(position.collateralAmount, 4)} ${
              market?.tokenTicker[defaultChain.id]
            }`}
          </Text>
        </HStack>
      </Stack>
    </Paper>
  ) : (
    <NextLink href={`${marketURI}`} style={{ width: '100%' }}>
      <Paper
        w={'full'}
        bg={market?.expired ? 'green.500' : 'grey.200'}
        _hover={{
          bg: market?.expired ? 'green.600' : 'blue.500',
        }}
        cursor='pointer'
        onMouseEnter={() => setColors(hoverColors)}
        onMouseLeave={() => setColors(unhoveredColors)}
        {...props}
      >
        <Stack direction='row'>
          <HStack w={'full'} spacing={1} justifyContent={'space-between'}>
            <Box>
              <Text {...paragraphMedium} color={cardColors.main}>
                {market?.proxyTitle ?? market?.title ?? 'Noname market'}
              </Text>
            </Box>

            <HStack>
              {market?.expired ? (
                <ClaimButton />
              ) : (
                <>
                  <Text {...paragraphMedium} color={cardColors.main}>
                    {`${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} 
                    ${market?.tokenTicker[defaultChain.id]}`}
                  </Text>

                  <Box gap={0}>{contractPriceChanged}</Box>
                </>
              )}

              <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={cardColors.main} />
            </HStack>
          </HStack>
        </Stack>

        <Stack direction='row' w={'full'} justifyContent={'space-between'} mt={'12px'}>
          <HStack w={'full'}>
            <VStack alignItems={'start'} gap={1}>
              <Text {...paragraphMedium} color={cardColors.secondary}>
                Position
              </Text>
              <Text {...paragraphRegular} color={cardColors.main}>
                {getOutcomeNotation()}
              </Text>
            </VStack>

            <VStack alignItems={'start'} gap={1} ml={'24px'}>
              <Text {...paragraphMedium} color={cardColors.secondary}>
                Invested
              </Text>
              <Text {...paragraphRegular} color={cardColors.main}>
                {`${NumberUtil.formatThousands(position.collateralAmount, 4)} ${
                  market?.tokenTicker[defaultChain.id]
                }`}
              </Text>
            </VStack>
          </HStack>

          <HStack w={'full'} justifyContent={'flex-end'} alignItems={'flex-end'}>
            <HStack gap={1} color={cardColors.secondary}>
              {<StatusIcon market={market} />}
            </HStack>
            <HStack gap={1} color={cardColors.secondary}>
              <CalendarIcon width={'16px'} height={'16px'} />
              <Text {...paragraphMedium} color={cardColors.secondary}>
                {market?.expirationDate}
              </Text>
            </HStack>
          </HStack>
        </Stack>
      </Paper>
    </NextLink>
  )
}
