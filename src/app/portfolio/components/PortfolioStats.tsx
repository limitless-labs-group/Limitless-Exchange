import { Box, Grid, GridItem, HStack, Text, VStack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import Paper from '@/components/common/paper'
import Skeleton from '@/components/common/skeleton'
import EnterTheGameButton from '@/app/portfolio/components/enter-the-game-button'
import { usePriceOracle } from '@/providers'
import GemIcon from '@/resources/icons/gem-icon.svg'
import HistoryIcon from '@/resources/icons/history-icon.svg'
import PointsIcon from '@/resources/icons/points-icon.svg'
import TrophyIcon from '@/resources/icons/trophy-icon.svg'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import {
  ClobPositionWithType,
  HistoryPositionWithType,
  useAccount,
  useBalanceQuery,
  useBalanceService,
  useLimitlessApi,
  usePosition,
} from '@/services'
import { h3Medium, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

const StatBox = ({
  title,
  icon,
  value,
  customContent,
}: {
  title: string
  icon: JSX.Element
  value: string | JSX.Element
  tooltip?: string
  customContent?: JSX.Element
}) => {
  return (
    <Paper flex={isMobile ? 1 : 'unset'} w={'full'} p='16px'>
      <VStack
        minH={isMobile ? '48px' : '96px'}
        justifyContent='space-between'
        alignItems='flex-start'
      >
        <HStack gap='4px' color='grey.500'>
          {icon}
          <Text {...paragraphMedium} color='grey.500'>
            {title}
          </Text>
        </HStack>
        <HStack w='full' justifyContent='space-between'>
          <Text {...h3Medium}>{value}</Text>
          {customContent}
        </HStack>
      </VStack>
    </Paper>
  )
}

export const PortfolioStats = () => {
  const { overallBalanceUsd, balanceLoading } = useBalanceService()
  const { convertAssetAmountToUsd } = usePriceOracle()
  const { supportedTokens } = useLimitlessApi()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { data: positions, isLoading: positionsLoading } = usePosition()
  const { web3Wallet } = useAccount()

  const balanceInvested = useMemo(() => {
    const ammPositions = positions?.positions.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.positions.filter(
      (position) => position.type === 'clob'
    ) as ClobPositionWithType[]
    let _balanceInvested = 0
    ammPositions?.forEach((position) => {
      let positionUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateralToken?.symbol
      )
      if (token) {
        positionUsdAmount = convertAssetAmountToUsd(token.priceOracleId, position.collateralAmount)
      }
      _balanceInvested += positionUsdAmount
    })
    clobPositions?.forEach((position) => {
      let positionUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateralToken.symbol
      )
      if (token) {
        const investedAmount = new BigNumber(position.positions.yes.cost)
          .plus(new BigNumber(position.positions.no.cost))
          .toString()
        const formattedInvestedAmount = formatUnits(
          BigInt(investedAmount),
          position.market.collateralToken.decimals
        )
        positionUsdAmount = convertAssetAmountToUsd(token.priceOracleId, formattedInvestedAmount)
        _balanceInvested += positionUsdAmount
      }
    })
    return NumberUtil.toFixed(_balanceInvested, 2)
  }, [positions])

  const balanceToWin = useMemo(() => {
    const ammPositions = positions?.positions.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.positions.filter(
      (position) => position.type === 'clob'
    ) as ClobPositionWithType[]
    let _balanceToWin = 0
    ammPositions?.forEach((position) => {
      let positionOutcomeUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateralToken?.symbol
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

  const totalRewards = positions
    ? formatUnits(BigInt(positions.rewards.totalUnpaidRewards), 6)
    : '0.00'
  const lastMinuteRewards = positions
    ? formatUnits(BigInt(positions.rewards.totalUserRewardsLastEpoch), 6)
    : '0.00'

  const stats = [
    {
      title: 'Portfolio',
      icon: <HistoryIcon width={16} height={16} />,
      value:
        positionsLoading || !positions || !web3Wallet ? (
          <Box w='120px'>
            <Skeleton height={20} />
          </Box>
        ) : (
          `${NumberUtil.convertWithDenomination(balanceInvested, 2)} USD`
        ),
    },
    {
      title: 'To win',
      icon: <TrophyIcon width={16} height={16} />,
      value:
        positionsLoading || !positions || !web3Wallet ? (
          <Box w='120px'>
            <Skeleton height={20} />
          </Box>
        ) : (
          `${NumberUtil.convertWithDenomination(balanceToWin, 2)} USD`
        ),
    },
    {
      title: 'Available Balance',
      icon: <WalletIcon width={16} height={16} />,
      value:
        balanceLoading || !balanceOfSmartWallet ? (
          <Box w='120px'>
            <Skeleton height={20} />
          </Box>
        ) : (
          `${NumberUtil.convertWithDenomination(overallBalanceUsd, 2)} USD`
        ),
    },
    {
      title: "Today's rewards",
      icon: <GemIcon width={16} height={16} />,
      value:
        balanceLoading || !balanceOfSmartWallet ? (
          <Box w='120px'>
            <Skeleton height={20} />
          </Box>
        ) : (
          <HStack gap='4px' alignItems='flex-end'>
            <Text {...h3Medium}>
              {+totalRewards ? NumberUtil.convertWithDenomination(totalRewards, 2) : '0.00'} USD
            </Text>
            {+lastMinuteRewards && (
              <HStack gap='4px' mb='2px'>
                <Text {...paragraphMedium} color='green.500'>
                  +{NumberUtil.convertWithDenomination(lastMinuteRewards, 2)} USD &#x2191;
                </Text>
                <Text {...paragraphMedium} color='grey.500'>
                  last minute
                </Text>
              </HStack>
            )}
          </HStack>
        ),
    },
    {
      title: 'Points',
      icon: <PointsIcon width={16} height={16} />,
      value:
        positionsLoading || !positions || !web3Wallet ? (
          <Box w='120px'>
            <Skeleton height={20} />
          </Box>
        ) : (
          `${+positions.points ? NumberUtil.convertToSymbols(positions.points) : '0.00'}`
        ),
      customContent: <EnterTheGameButton />,
    },
  ]

  return (
    <Grid templateColumns={isMobile ? '1fr' : 'repeat(6, 1fr)'} gap='12px' mt='24px'>
      {stats.map((stat, index) =>
        isMobile ? (
          <StatBox {...stat} key={index} />
        ) : (
          <GridItem key={index} colSpan={index < 2 ? 3 : 2} rowStart={index < 2 ? 1 : 2}>
            <StatBox {...stat} />
          </GridItem>
        )
      )}
    </Grid>
  )
}
