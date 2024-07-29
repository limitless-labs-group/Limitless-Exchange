import { defaultChain } from '@/constants'
import { HistoryPosition } from '@/services'
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
import { useMarketData } from '@/hooks'
import { useMarket } from '@/services/MarketsService'
import { useToken } from '@/hooks/use-token'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ClosedIcon from '@/resources/icons/close-rounded-icon.svg'
import ActiveIcon from '@/resources/icons/active-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import WinIcon from '@/resources/icons/win-icon.svg'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

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
  /**
   * NAVIGATION
   */
  const router = useRouter()

  /**
   * MARKET DATA
   */
  const { data: market } = useMarket(position.market.id)
  const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])
  const { outcomeTokensPercent } = useMarketData({
    marketAddress: position.market.id,
    collateralToken,
  })

  const chancePercent = useMemo(() => {
    if (market?.expired) {
      return market?.winningOutcomeIndex === 0 ? '100' : '0'
    }
    return outcomeTokensPercent?.[market?.outcomeTokens[0] === 'Yes' ? 0 : 1].toFixed(1)
  }, [market, outcomeTokensPercent])

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
      <Button variant='white' onClick={() => router.push(marketURI)}>
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
                {(position?.outcomeIndex === 0 ? (
                  <Text color={'green.500'}>↑{chancePercent}%</Text>
                ) : (
                  <Text color={'red.500'}>↓{chancePercent}%</Text>
                )) ?? ''}
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
    <Paper
      onClick={() => router.push(marketURI)}
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

                <Box gap={0}>
                  {(position?.outcomeIndex === 0 ? (
                    <Text
                      {...paragraphMedium}
                      color={cardColors.main === 'grey.800' ? 'green.500' : cardColors.main}
                    >
                      ↑{chancePercent}%
                    </Text>
                  ) : (
                    <Text
                      {...paragraphMedium}
                      color={cardColors.main === 'grey.800' ? 'red.500' : cardColors.main}
                    >
                      ↓{chancePercent}%
                    </Text>
                  )) ?? ''}
                </Box>
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
  )
}
