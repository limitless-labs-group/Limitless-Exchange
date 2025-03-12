import { Flex, HStack, StackProps, Text, Box, VStack, Stack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import Skeleton from '@/components/common/skeleton'
import { usePriceOracle } from '@/providers'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import {
  ClobPositionWithType,
  HistoryPositionWithType,
  useBalanceQuery,
  useBalanceService,
  useLimitlessApi,
  usePosition,
} from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

const StatBox = ({
  title,
  icon,
  value,
  border,
  isLast,
  isFirst,
  w,
}: {
  title: string
  icon: JSX.Element
  value: string | JSX.Element
  border: boolean
  isLast?: boolean
  isFirst?: boolean
  w?: string
}) => {
  const paddingLeft = useMemo(() => {
    if (isMobile) {
      return !isFirst && !isLast
    }
    return !isFirst
  }, [isLast, isFirst])

  const borderRight = useMemo(() => {
    if (isMobile) {
      return isFirst || isLast
    }
    return border && !isLast
  }, [isLast, isFirst, border])

  return (
    <Box
      pt='7px'
      pb='11px'
      flex={isMobile ? 1 : 'unset'}
      borderRight={borderRight ? '1px solid' : 'unset'}
      pl={paddingLeft ? '8px' : 0}
      w={w && !isMobile ? w : 'unset'}
      borderTop={isMobile ? '1px solid' : 'unset'}
    >
      <Text {...paragraphMedium}>{value}</Text>
      <HStack gap='4px' color='grey.500'>
        {icon}
        <Text {...paragraphMedium} color='grey.500'>
          {title}
        </Text>
      </HStack>
    </Box>
  )
}

export const PortfolioStats = ({ ...props }: StackProps) => {
  const { overallBalanceUsd, balanceLoading } = useBalanceService()
  const { convertAssetAmountToUsd } = usePriceOracle()
  const { supportedTokens } = useLimitlessApi()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { data: positions, isLoading: positionsLoading } = usePosition()

  const balanceInvested = useMemo(() => {
    const ammPositions = positions?.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.filter(
      (position) => position.type === 'clob'
    ) as ClobPositionWithType[]
    let _balanceInvested = 0
    ammPositions?.forEach((position) => {
      let positionUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateral?.symbol
      )
      if (!!token) {
        positionUsdAmount = convertAssetAmountToUsd(token.priceOracleId, position.collateralAmount)
      }
      _balanceInvested += positionUsdAmount
    })
    return NumberUtil.toFixed(_balanceInvested, 2)
  }, [positions])

  const balanceToWin = useMemo(() => {
    const ammPositions = positions?.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.filter(
      (position) => position.type === 'clob'
    ) as ClobPositionWithType[]
    let _balanceToWin = 0
    ammPositions?.forEach((position) => {
      let positionOutcomeUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateral?.symbol
      )
      if (token) {
        positionOutcomeUsdAmount = convertAssetAmountToUsd(
          token.priceOracleId,
          position.outcomeTokenAmount
        )
      }
      _balanceToWin += positionOutcomeUsdAmount
    })
    clobPositions?.forEach((clobPosition) => {
      const isPositionClaimable = clobPosition.market.winningOutcomeIndex !== null
      const token = supportedTokens?.find(
        (token) => token.symbol === clobPosition.market.collateralToken.symbol
      )
      if (isPositionClaimable) {
        const tokensAmount =
          clobPosition.market.winningOutcomeIndex === 1
            ? clobPosition.tokensBalance.no
            : clobPosition.tokensBalance.yes
        if (token) {
          const usdAmount = convertAssetAmountToUsd(
            token.priceOracleId,
            formatUnits(BigInt(tokensAmount), clobPosition.market.collateralToken.decimals)
          )
          _balanceToWin += usdAmount
          return
        }
      }
      const sharesDifference = Math.abs(
        new BigNumber(clobPosition.tokensBalance.no)
          .minus(clobPosition.tokensBalance.yes)
          .toNumber()
      )
      if (token) {
        const usdAmount = convertAssetAmountToUsd(
          token.priceOracleId,
          formatUnits(BigInt(sharesDifference), clobPosition.market.collateralToken.decimals)
        )
        _balanceToWin += usdAmount
        return
      }
    })
    return NumberUtil.toFixed(_balanceToWin, 2)
  }, [positions, supportedTokens])

  const stats = [
    {
      title: 'Portfolio',
      icon: <PortfolioIcon width={16} height={16} />,
      value:
        positionsLoading || !positions ? (
          <Skeleton height={20} />
        ) : (
          `${NumberUtil.formatThousands(balanceInvested, 2)} USD`
        ),
      border: true,
      w: '213px',
    },
    {
      title: 'To win',
      icon: <CalendarIcon width={16} height={16} />,
      value:
        positionsLoading || !positions ? (
          <Skeleton height={20} />
        ) : (
          `${NumberUtil.formatThousands(balanceToWin, 2)} USD`
        ),
      border: !isMobile,
      w: '166px',
    },
    {
      title: 'Available Balance',
      icon: <WalletIcon width={16} height={16} />,
      value:
        balanceLoading || !balanceOfSmartWallet ? (
          <Skeleton height={20} />
        ) : (
          `${NumberUtil.formatThousands(overallBalanceUsd, 2)} USD`
        ),
      border: true,
    },
  ]

  return (
    <Stack w={'full'} mb={isMobile ? '48px' : '24px'}>
      {isMobile ? (
        <Flex mt={'24px'}>
          <VStack w={'full'} gap={0}>
            <HStack gap={0} w={'full'}>
              <StatBox {...stats[0]} isFirst />
              <StatBox {...stats[1]} />
            </HStack>
            <HStack gap={0} w={'full'} h={'full'}>
              <StatBox {...stats[2]} isLast />
              <Box
                pt='7px'
                pb='11px'
                flex={1}
                borderColor='grey.800'
                borderTop='1px solid'
                pl={'8px'}
                w={'full'}
                h={'full'}
              />
            </HStack>
          </VStack>
        </Flex>
      ) : (
        <Flex {...props} w='full' borderColor='grey.800' borderTop='1px solid'>
          {stats.map((stat, index) => (
            <StatBox
              key={stat.title}
              {...stat}
              isLast={index === stats.length - 1}
              isFirst={!index}
            />
          ))}
        </Flex>
      )}
    </Stack>
  )
}
