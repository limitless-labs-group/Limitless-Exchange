import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { Address, formatUnits, maxUint256, parseUnits } from 'viem'
import ClobTradeButton from '@/components/common/markets/clob-widget/clob-trade-button'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import TradeWidgetSkeleton, {
  SkeletonType,
} from '@/components/common/skeleton/trade-widget-skeleton'
import { useOrderBook } from '@/hooks/use-order-book'
import usePrivySendTransaction from '@/hooks/use-smart-wallet-service'
import {
  ClickEvent,
  useAccount,
  useAmplitude,
  useBalanceService,
  useTradingService,
} from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function ClobMarketTradeForm() {
  const { balanceLoading } = useBalanceService()
  const { trackClicked } = useAmplitude()
  const { market, strategy } = useTradingService()
  const { data: orderBook } = useOrderBook(market?.slug)
  const queryClient = useQueryClient()
  const { account } = useAccount()
  const {
    setPrice,
    price,
    outcome,
    balance,
    placeMarketOrderMutation,
    allowance,
    isApprovedForSell,
    onToggleTradeStepper,
    sharesPrice,
    isBalanceNotEnough,
    sharesAvailable,
  } = useClobWidget()
  const { client } = useWeb3Service()
  const privyService = usePrivySendTransaction()

  const handlePercentButtonClicked = (value: number) => {
    trackClicked(ClickEvent.TradingWidgetPricePrecetChosen, {
      amount: value,
      marketAddress: market?.slug,
      marketType: market?.marketType,
      marketTags: market?.tags,
    })
    if (strategy === 'Buy') {
      if (value == 100) {
        setPrice(NumberUtil.toFixed(balance, market?.collateralToken.symbol === 'USDC' ? 1 : 6))
        return
      }
      const amountByPercent = (Number(balance) * value) / 100
      setPrice(
        NumberUtil.toFixed(amountByPercent, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
      )
      return
    }
    const sharesAmount = outcome
      ? NumberUtil.formatThousands(
          formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6),
          6
        )
      : NumberUtil.formatThousands(
          formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6),
          6
        )
    if (value === 100) {
      setPrice(sharesAmount)
      return
    }
    const amountByPercent = (Number(sharesAmount) * value) / 100
    setPrice(NumberUtil.toFixed(amountByPercent, market?.collateralToken.symbol === 'USDC' ? 1 : 6))
    return
  }

  const handleInputValueChange = (value: string) => {
    if (market?.collateralToken.symbol === 'USDC') {
      const decimals = value.split('.')[1]
      if (decimals && decimals.length > 2) {
        return
      }
      setPrice(value)
      return
    }
    setPrice(value)
    return
  }

  const renderButtonContent = (title: number) => {
    if (title === 100) {
      if (isMobile) {
        return 'MAX'
      }
      let balanceToShow = ''
      if (strategy === 'Buy') {
        balanceToShow = NumberUtil.formatThousands(
          balance,
          market?.collateralToken.symbol === 'USDC' ? 1 : 6
        )
      } else {
        balanceToShow = outcome
          ? NumberUtil.formatThousands(
              formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6),
              6
            )
          : NumberUtil.formatThousands(
              formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6),
              6
            )
      }
      return `MAX: ${
        balanceLoading ? (
          <Box w='90px'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        ) : (
          balanceToShow
        )
      } ${strategy === 'Buy' ? market?.collateralToken.symbol : ''}`
    }
    return `${title}%`
  }

  const orderCalculations = useMemo(() => {
    if (!price || !orderBook || !market) {
      return {
        contracts: 0,
        avgPrice: 0,
        payout: 0,
        profit: 0,
      }
    }
    if (strategy === 'Buy') {
      const targetSide = !outcome
        ? orderBook.asks
        : orderBook.asks.map((a) => ({ ...a, price: new BigNumber(1).minus(a.price).toNumber() }))

      targetSide.sort((a, b) => a.price - b.price)

      let totalContracts = 0
      let totalCost = 0
      let remainingAmount = +price

      for (const entry of targetSide) {
        const contractsAvailable = +formatUnits(
          BigInt(entry.size.toFixed()),
          market.collateralToken.decimals
        )
        const contractsToBuy = Math.min(
          new BigNumber(remainingAmount).dividedBy(new BigNumber(entry.price)).toNumber(),
          contractsAvailable
        )

        totalContracts = new BigNumber(totalContracts).plus(contractsToBuy).toNumber()
        totalCost = new BigNumber(totalCost)
          .plus(new BigNumber(contractsToBuy).multipliedBy(new BigNumber(entry.price)))
          .toNumber()

        remainingAmount = new BigNumber(remainingAmount)
          .minus(new BigNumber(contractsToBuy).multipliedBy(new BigNumber(entry.price)))
          .toNumber()

        if (remainingAmount <= 0) break
      }

      const averagePrice =
        totalContracts > 0 ? new BigNumber(totalCost).dividedBy(totalContracts).toNumber() : 0
      const totalProfit = new BigNumber(totalContracts)
        .multipliedBy(new BigNumber(1).minus(new BigNumber(averagePrice)))
        .toNumber()

      return {
        contracts: isNaN(totalContracts) ? 0 : totalContracts,
        avgPrice: isNaN(averagePrice) ? 0 : averagePrice,
        payout: isNaN(totalContracts) ? 0 : totalContracts,
        profit: isNaN(totalProfit) ? 0 : totalProfit,
      }
    }

    if (strategy === 'Sell') {
      const targetSide = !outcome
        ? orderBook.bids
        : orderBook.asks.map((b) => ({ ...b, price: new BigNumber(1).minus(b.price).toNumber() }))

      targetSide.sort((a, b) => b.price - a.price)

      let totalContractsSold = 0
      let totalAmountReceived = 0
      let remainingContracts = +price

      for (const entry of targetSide) {
        const contractsAvailable = +formatUnits(
          BigInt(entry.size.toFixed()),
          market.collateralToken.decimals
        )
        const contractsToSell = Math.min(remainingContracts, contractsAvailable)

        totalContractsSold = new BigNumber(totalContractsSold)
          .plus(new BigNumber(contractsToSell))
          .toNumber()
        totalAmountReceived = new BigNumber(totalAmountReceived)
          .plus(new BigNumber(contractsToSell).multipliedBy(new BigNumber(entry.price)))
          .toNumber()

        remainingContracts = new BigNumber(remainingContracts)
          .minus(new BigNumber(contractsToSell))
          .toNumber()

        if (remainingContracts <= 0) break
      }

      const averagePrice =
        totalContractsSold > 0
          ? new BigNumber(totalAmountReceived)
              .dividedBy(new BigNumber(totalContractsSold))
              .toNumber()
          : 0

      return {
        contracts: isNaN(totalContractsSold) ? 0 : totalContractsSold,
        avgPrice: isNaN(averagePrice) ? 0 : averagePrice,
        payout: isNaN(totalAmountReceived) ? 0 : totalAmountReceived,
        profit: 0,
      }
    }
    return {
      contracts: 0,
      avgPrice: 0,
      payout: 0,
      profit: 0,
    }
  }, [market, orderBook, outcome, price, strategy])

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
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug],
    })
    placeMarketOrderMutation.reset()
  }

  const handleSubmitButtonClicked = async () => {
    if (strategy === 'Buy') {
      if (client === 'etherspot') {
        await privyService.approveCollateralIfNeeded(
          process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
          maxUint256,
          market?.collateralToken.address as Address
        )
        await placeMarketOrderMutation.mutateAsync()
        return
      }
      const isApprovalNeeded = new BigNumber(allowance.toString()).isLessThan(
        parseUnits(sharesPrice, market?.collateralToken.decimals || 6).toString()
      )
      if (isApprovalNeeded) {
        onToggleTradeStepper()
        return
      }
      await placeMarketOrderMutation.mutateAsync()
      return
    }
    if (client === 'etherspot') {
      await privyService.approveConditionalIfNeeded(
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
        process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address
      )
      await placeMarketOrderMutation.mutateAsync()
      return
    }
    if (!isApprovedForSell) {
      onToggleTradeStepper()
      return
    }
    await placeMarketOrderMutation.mutateAsync()
    return
  }

  return (
    <>
      <Flex justifyContent='space-between' alignItems='center'>
        <Text {...paragraphMedium} color={'var(--chakra-colors-text-100)'}>
          Enter amount
        </Text>
        {balanceLoading ? (
          <Box w='90px'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        ) : (
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
        )}
      </Flex>
      <InputGroup display='block' mt='8px'>
        <Input
          value={price}
          onChange={(e) => handleInputValueChange(e.target.value)}
          variant='grey'
          errorBorderColor='red.500'
          pl={isMobile ? '32px' : '28px'}
          id='displayName'
          autoComplete='off'
          placeholder='Eg. 5'
          px='12px'
          py='8px'
          h='32px'
          isInvalid={isBalanceNotEnough}
        />
        <InputRightElement h='16px' top='8px' right={isMobile ? '8px' : '12px'} w='fit'>
          <Text {...paragraphMedium} color={'grey.500'}>
            {strategy === 'Buy' ? market?.collateralToken.symbol : 'Contracts'}
          </Text>
        </InputRightElement>
      </InputGroup>
      <VStack w='full' gap='8px' my='24px'>
        {strategy === 'Buy' && (
          <HStack w='full' justifyContent='space-between'>
            <Text {...paragraphMedium} color='grey.500'>
              Contracts
            </Text>
            <Text
              {...paragraphMedium}
              color={!orderCalculations.contracts ? 'grey.500' : 'grey.800'}
            >
              {NumberUtil.toFixed(orderCalculations.contracts, 6)}
            </Text>
          </HStack>
        )}
        <HStack w='full' justifyContent='space-between'>
          <Text {...paragraphMedium} color='grey.500'>
            Avg. price
          </Text>
          <Text {...paragraphMedium} color={!orderCalculations.avgPrice ? 'grey.500' : 'grey.800'}>
            {NumberUtil.convertWithDenomination(orderCalculations.avgPrice, 6)}{' '}
            {market?.collateralToken.symbol}
          </Text>
        </HStack>
        <HStack w='full' justifyContent='space-between'>
          <Text {...paragraphMedium} color='grey.500'>
            {strategy === 'Buy' ? `Payout if ${outcome ? 'No' : 'Yes'} wins` : 'Total'}
          </Text>
          <Text {...paragraphMedium} color={!orderCalculations.payout ? 'grey.500' : 'grey.800'}>
            {NumberUtil.toFixed(orderCalculations.payout, 2)} USDC{' '}
            {Boolean(orderCalculations.profit) && (
              <Text color='green.500' as='span'>
                (+{NumberUtil.toFixed(orderCalculations.profit, 2)})
              </Text>
            )}
          </Text>
        </HStack>
      </VStack>
      <ClobTradeButton
        status={placeMarketOrderMutation.status}
        isDisabled={!price || isBalanceNotEnough || !account}
        onClick={handleSubmitButtonClicked}
        successText={`${strategy === 'Buy' ? 'Bought' : 'Sold'} ${NumberUtil.toFixed(
          orderCalculations.contracts,
          6
        )} contracts`}
        onReset={onResetMutation}
      >
        {strategy} {outcome ? 'No' : 'Yes'}
      </ClobTradeButton>
      {!price && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Enter amount to {strategy === 'Buy' ? 'buy' : 'sell'}
        </Text>
      )}
    </>
  )
}
