import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { Address, formatUnits, maxUint256, parseUnits } from 'viem'
import ClobTradeButton from '@/components/common/markets/clob-widget/clob-trade-button'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import NumberInputWithButtons from '@/components/common/number-input-with-buttons'
import TradeWidgetSkeleton, {
  SkeletonType,
} from '@/components/common/skeleton/trade-widget-skeleton'
import useClobMarketShares from '@/hooks/use-clob-market-shares'
import {
  ClickEvent,
  useAccount,
  useAmplitude,
  useBalanceService,
  useEtherspot,
  useTradingService,
} from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function ClobLimitTradeForm() {
  const { balanceLoading } = useBalanceService()
  const {
    balance,
    outcome,
    setPrice,
    price,
    sharesAmount,
    setSharesAmount,
    placeLimitOrderMutation,
    allowance,
    sharesPrice,
    isApprovedForSell,
    onToggleTradeStepper,
    isBalanceNotEnough,
  } = useClobWidget()
  const { trackClicked } = useAmplitude()
  const { account } = useAccount()
  const { market, strategy } = useTradingService()
  const queryClient = useQueryClient()
  const { client } = useWeb3Service()
  const { etherspot } = useEtherspot()
  const { data: sharesOwned, isLoading: ownedSharesLoading } = useClobMarketShares(
    market?.slug,
    market?.tokens
  )

  const handlePercentButtonClicked = (value: number) => {
    trackClicked(ClickEvent.TradingWidgetPricePrecetChosen, {
      amount: value,
      marketAddress: market?.slug,
      marketType: market?.marketType,
      marketTags: market?.tags,
    })
    const sharesAmount = outcome
      ? NumberUtil.formatThousands(
          formatUnits(sharesOwned?.[1] || 0n, market?.collateralToken.decimals || 6),
          6
        )
      : NumberUtil.formatThousands(
          formatUnits(sharesOwned?.[0] || 0n, market?.collateralToken.decimals || 6),
          6
        )
    if (value === 100) {
      setSharesAmount(sharesAmount)
      return
    }
    const amountByPercent = (Number(sharesAmount) * value) / 100
    setSharesAmount(
      NumberUtil.toFixed(amountByPercent, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
    )
    return
  }

  const renderButtonContent = (title: number) => {
    if (title === 100) {
      if (isMobile) {
        return 'MAX'
      }
      const balanceToShow = outcome
        ? NumberUtil.formatThousands(
            formatUnits(sharesOwned?.[1] || 0n, market?.collateralToken.decimals || 6),
            6
          )
        : NumberUtil.formatThousands(
            formatUnits(sharesOwned?.[0] || 0n, market?.collateralToken.decimals || 6),
            6
          )
      return `MAX: ${
        ownedSharesLoading ? (
          <Box w='90px'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        ) : (
          balanceToShow
        )
      }`
    }
    return `${title}%`
  }

  const showBuyBalance = useMemo(() => {
    if (strategy === 'Buy') {
      return balanceLoading ? (
        <Box w='90px'>
          <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
        </Box>
      ) : (
        <Text {...paragraphRegular} color='grey.500'>
          Balance: {NumberUtil.formatThousands(balance, 2)} {market?.collateralToken.symbol}
        </Text>
      )
    }
    return null
  }, [balance, balanceLoading, market?.collateralToken.symbol, strategy])

  const showSellBalance = useMemo(() => {
    if (strategy === 'Sell') {
      if (ownedSharesLoading) {
        return (
          <Box w='90'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        )
      }

      return (
        <Flex gap='12px'>
          {[10, 25, 50, 100].map((title: number) => (
            <Button
              {...paragraphRegular}
              p='0'
              borderRadius='0'
              minW='unset'
              h='auto'
              variant='plain'
              key={title}
              flex={1}
              onClick={() => handlePercentButtonClicked(title)}
              color='grey.500'
              borderBottom='1px dotted'
              borderColor='rgba(132, 132, 132, 0.5)'
              _hover={{
                borderColor: 'var(--chakra-colors-text-100)',
                color: 'var(--chakra-colors-text-100)',
              }}
              disabled={balanceLoading}
            >
              {renderButtonContent(title)}
            </Button>
          ))}
        </Flex>
      )
    }
  }, [balanceLoading, ownedSharesLoading, strategy])

  const orderCalculations = useMemo(() => {
    if (!price || !sharesAmount) {
      return {
        total: 0,
        payout: 0,
        profit: 0,
      }
    }
    const total = new BigNumber(sharesAmount).multipliedBy(price).dividedBy(100).toNumber()
    if (strategy === 'Buy') {
      return {
        total: total,
        payout: +sharesAmount,
        profit: new BigNumber(sharesAmount).minus(new BigNumber(total)).toNumber(),
      }
    }
    if (strategy === 'Sell') {
      return {
        total: 0,
        payout: total,
        profit: 0,
      }
    }
    return {
      total: 0,
      payout: 0,
      profit: 0,
    }
  }, [price, sharesAmount, strategy])

  const onResetMutation = async () => {
    await queryClient.refetchQueries({
      queryKey: ['user-orders', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['order-book', market?.slug],
    })
    placeLimitOrderMutation.reset()
  }

  const handleSubmitButtonClicked = async () => {
    if (strategy === 'Buy') {
      if (client === 'etherspot') {
        await etherspot?.approveCollateralIfNeeded(
          process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
          maxUint256,
          market?.collateralToken.address as Address
        )
        await placeLimitOrderMutation.mutateAsync()
        return
      }
      const isApprovalNeeded = new BigNumber(allowance.toString()).isLessThan(
        parseUnits(sharesPrice, market?.collateralToken.decimals || 6).toString()
      )
      if (isApprovalNeeded) {
        onToggleTradeStepper()
        return
      }
      await placeLimitOrderMutation.mutateAsync()
      return
    }
    if (client === 'etherspot') {
      await etherspot?.approveConditionalIfNeeded(
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
        process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address
      )
      await placeLimitOrderMutation.mutateAsync()
      return
    }
    if (!isApprovedForSell) {
      onToggleTradeStepper()
      return
    }
    await placeLimitOrderMutation.mutateAsync()
  }

  return (
    <>
      <Flex justifyContent='space-between' alignItems='center' mb='8px'>
        <Text {...paragraphMedium} color={'var(--chakra-colors-text-100)'}>
          Limit price
        </Text>
        {showBuyBalance}
      </Flex>
      <NumberInputWithButtons
        id='limitPrice'
        placeHolderText='Eg. 85¢'
        min={1}
        max={99}
        step={1}
        value={price}
        onChange={setPrice}
      />
      <Flex justifyContent='space-between' alignItems='center' mt='16px' mb='8px'>
        <Text {...paragraphMedium} color={'var(--chakra-colors-text-100)'}>
          Contracts
        </Text>
        {showSellBalance}
      </Flex>
      <NumberInputWithButtons
        id='contractsAmount'
        min={1}
        step={1}
        placeHolderText='Eg. 32'
        value={sharesAmount}
        onChange={setSharesAmount}
        isInvalid={isBalanceNotEnough}
      />
      <VStack w='full' gap='8px' my='24px'>
        {strategy === 'Buy' ? (
          <>
            <HStack w='full' justifyContent='space-between'>
              <Text {...paragraphMedium} color='grey.500'>
                Cost
              </Text>
              <Text {...paragraphMedium} color={!orderCalculations.total ? 'grey.500' : 'grey.800'}>
                {NumberUtil.toFixed(orderCalculations.total, 2)} {market?.collateralToken.symbol}
              </Text>
            </HStack>
            <HStack w='full' justifyContent='space-between'>
              <Text {...paragraphMedium} color='grey.500'>
                Payout if {outcome ? 'No' : 'Yes'} wins
              </Text>
              <Text
                {...paragraphMedium}
                color={!orderCalculations.payout ? 'grey.500' : 'grey.800'}
              >
                {NumberUtil.toFixed(orderCalculations.payout, 2)} {market?.collateralToken.symbol}
                {Boolean(orderCalculations.profit) && (
                  <Text color='green.500' as='span'>
                    {' '}
                    (+{NumberUtil.toFixed(orderCalculations.profit, 2)})
                  </Text>
                )}
              </Text>
            </HStack>
          </>
        ) : (
          <>
            <HStack w='full' justifyContent='space-between'>
              <Text {...paragraphMedium} color='grey.500'>
                Profit
              </Text>
              <Text
                {...paragraphMedium}
                color={!orderCalculations.payout ? 'grey.500' : 'grey.800'}
              >
                {NumberUtil.toFixed(orderCalculations.payout, 2)} {market?.collateralToken.symbol}
              </Text>
            </HStack>
          </>
        )}
      </VStack>
      <ClobTradeButton
        status={placeLimitOrderMutation.status}
        isDisabled={!price || !sharesAmount || isBalanceNotEnough || !account}
        onClick={handleSubmitButtonClicked}
        successText={`Submitted`}
        onReset={onResetMutation}
      >
        Submit {strategy} Order
      </ClobTradeButton>
      {(!price || !sharesAmount) && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Set {!price && 'Limit price'}
          {!price && !sharesAmount ? ',' : ''} {!sharesAmount && 'Contracts'}
        </Text>
      )}
    </>
  )
}
