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
import { useMemo } from 'react'
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

export const PortfolioPositionCard = ({ position, ...props }: IPortfolioPositionCard) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()

  /**
   * MARKET DATA
   */
  const market = useMarket(position.market.id)
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

  /**
   * UTILS
   */
  const getColor = (defaultColor = 'grey.800') => (market?.expired ? 'grey.50' : defaultColor)

  const getOutcomeNotation = () => {
    const outcomeTokenId = position.outcomeIndex ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return market?.outcomeTokens[outcomeTokenId] ?? defaultOutcomes[outcomeTokenId]
  }

  const ClaimButton = () => {
    return (
      <Button variant='white' onClick={() => router.push(marketURI)}>
        <Icon as={WinIcon} color={'grey.800'} />
        Claim{' '}
        {`${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} ${
          market?.tokenTicker[defaultChain.id]
        }`}
      </Button>
    )
  }

  //@ts-ignore
  const StatusIcon = ({ market }) =>
    market?.expired ? (
      <>
        <Icon
          as={ClosedIcon}
          width={'16px'}
          height={'16px'}
          color={!isMobile ? 'transparent.700' : 'grey.50'}
        />
        <Text {...paragraphMedium} color={!isMobile ? 'transparent.700' : 'grey.50'}>
          Closed
        </Text>
      </>
    ) : (
      <>
        <ActiveIcon width={16} height={16} />
        <Text {...paragraphMedium} color={getColor('grey.500')}>
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
          <Text {...paragraphMedium} color={getColor()}>
            {market?.title ?? 'Noname market'}
          </Text>
          <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={getColor()} />
        </HStack>
        <HStack>
          {market?.expired ? (
            <Text {...paragraphMedium} color={getColor()}>
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
        <HStack color={getColor('grey.500')}>
          <HStack gap={1}>{<StatusIcon market={market} />}</HStack>
          <HStack gap={1} color={getColor('grey.500')}>
            <CalendarIcon width={'16px'} height={'16px'} />
            <Text {...paragraphMedium} color={getColor('grey.500')}>
              {market?.expirationDate}
            </Text>
          </HStack>
        </HStack>
        <HStack>{market?.expired && <ClaimButton />}</HStack>
      </Stack>

      <Divider w={'full'} bgColor={'grey.400'} h={'1px'} mb={'10px'} mt={'10px'} />

      <Stack w={'full'}>
        <HStack alignItems={'start'} gap={0} justifyContent={'space-between'}>
          <Text {...paragraphMedium} color={getColor('grey.500')}>
            Position
          </Text>
          <Text color={getColor()} fontWeight={400} lineHeight={'20px'} fontSize={'16px'}>
            {getOutcomeNotation()}
          </Text>
        </HStack>
      </Stack>
      <Stack w={'full'} mt={'8px'}>
        <HStack alignItems={'start'} gap={0} justifyContent={'space-between'}>
          <Text {...paragraphMedium} color={getColor('grey.500')}>
            Invested
          </Text>
          <Text color={getColor()} lineHeight={'20px'} fontWeight={400} fontSize={'16px'}>
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
      cursor='pointer'
      {...props}
    >
      <Stack direction='row'>
        <HStack w={'full'} spacing={1} justifyContent={'space-between'}>
          <Box>
            <Text {...paragraphMedium} color={getColor()}>
              {market?.title ?? 'Noname market'}
            </Text>
          </Box>

          <HStack>
            {market?.expired ? (
              <ClaimButton />
            ) : (
              <>
                <Text {...paragraphMedium}>
                  {`${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} 
                    ${market?.tokenTicker[defaultChain.id]}`}
                </Text>

                <Box gap={0}>
                  {(position?.outcomeIndex === 0 ? (
                    <Text {...paragraphMedium} color={'green.500'}>
                      ↑{chancePercent}%
                    </Text>
                  ) : (
                    <Text {...paragraphMedium} color={'red.500'}>
                      ↓{chancePercent}%
                    </Text>
                  )) ?? ''}
                </Box>
              </>
            )}

            <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={getColor()} />
          </HStack>
        </HStack>
      </Stack>

      <Stack direction='row' w={'full'} justifyContent={'space-between'} mt={'12px'}>
        <HStack w={'full'}>
          <VStack alignItems={'start'} gap={1}>
            <Text {...paragraphMedium} color={market?.expired ? 'transparent.700' : 'grey.500'}>
              Position
            </Text>
            <Text {...paragraphRegular} color={getColor()}>
              {getOutcomeNotation()}
            </Text>
          </VStack>

          <VStack alignItems={'start'} gap={1} ml={'24px'}>
            <Text {...paragraphMedium} color={market?.expired ? 'transparent.700' : 'grey.500'}>
              Invested
            </Text>
            <Text {...paragraphRegular} color={getColor()}>
              {`${NumberUtil.formatThousands(position.collateralAmount, 4)} ${
                market?.tokenTicker[defaultChain.id]
              }`}
            </Text>
          </VStack>
        </HStack>

        <HStack w={'full'} justifyContent={'flex-end'} alignItems={'flex-end'}>
          <HStack gap={1} color={getColor('grey.500')}>
            {<StatusIcon market={market} />}
          </HStack>
          <HStack gap={1} color={market?.expired ? 'transparent.700' : 'grey.500'}>
            <CalendarIcon width={'16px'} height={'16px'} />
            <Text {...paragraphMedium} color={market?.expired ? 'transparent.700' : 'grey.500'}>
              {market?.expirationDate}
            </Text>
          </HStack>
        </HStack>
      </Stack>
    </Paper>
  )
}
