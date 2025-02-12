import { Box, Button, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { useOrderBook } from '@/hooks/use-order-book'
import usePrivySendTransaction from '@/hooks/use-smart-wallet-service'
import {
  ClickEvent,
  useAccount,
  useAmplitude,
  useBalanceService,
  useTradingService,
} from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function ClobMarketTradeForm() {
  const { balanceLoading } = useBalanceService()
  const { trackClicked } = useAmplitude()
  const { market, strategy, clobOutcome: outcome } = useTradingService()
  const { data: orderBook } = useOrderBook(market?.slug)
  const queryClient = useQueryClient()
  const { web3Wallet } = useAccount()
  const {
    setPrice,
    price,
    balance,
    allowance,
    isApprovedForSell,
    onToggleTradeStepper,
    sharesPrice,
    isBalanceNotEnough,
    sharesAvailable,
    yesPrice,
    noPrice,
  } = useClobWidget()
  const { client, placeMarketOrder } = useWeb3Service()
  const { web3Client, profileData } = useAccount()
  const privyService = usePrivySendTransaction()
  const privateClient = useAxiosPrivateClient()
  const toast = useToast()

  const placeMarketOrderMutation = useMutation({
    mutationKey: ['market-order', market?.slug, price],
    mutationFn: async () => {
      trackClicked(ClickEvent.ConfirmTransactionClicked, {
        address: market?.slug,
        outcome: outcome,
        strategy,
        walletType: web3Client,
        marketType: market?.marketType,
        marketMakerType: 'ClOB',
        tradingMode: 'market order',
      })
      if (market) {
        if (web3Client === 'etherspot') {
          if (strategy === 'Sell') {
            await privyService.approveConditionalIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
            )
          } else {
            await privyService.approveCollateralIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              maxUint256,
              market?.collateralToken.address as Address
            )
          }
        }
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeMarketOrder(
          tokenId,
          market.collateralToken.decimals,
          outcome === 0 ? yesPrice.toString() : noPrice.toString(),
          side,
          price
        )
        const data = {
          order: {
            ...signedOrder,
            salt: +signedOrder.salt,
            price: undefined,
            makerAmount: +parseUnits(price, market.collateralToken.decimals).toString(),
            takerAmount: +signedOrder.takerAmount,
            nonce: +signedOrder.nonce,
            feeRateBps: +signedOrder.feeRateBps,
          },
          ownerId: profileData?.id,
          orderType: 'FOK',
          marketSlug: market.slug,
        }
        return privateClient.post('/orders', data)
      }
    },
    onError: async () => {
      const id = toast({
        render: () => <Toast title={'Oops... Something went wrong'} id={id} />,
      })
      await queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      })
    },
  })

  const handlePercentButtonClicked = (value: number) => {
    trackClicked(ClickEvent.TradingWidgetPricePrecetChosen, {
      amount: value,
      marketAddress: market?.slug,
      marketType: market?.marketType,
      marketTags: market?.tags,
      marketMakerType: 'CLOB',
      assetType: strategy === 'Buy' ? 'money' : 'contracts',
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
      if (decimals && decimals.length > 6) {
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
              formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6),
              6
            )
          : NumberUtil.formatThousands(
              formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6),
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
        : orderBook.bids.map((a) => ({ ...a, price: new BigNumber(1).minus(a.price).toNumber() }))

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
          new BigNumber(remainingAmount)
            .dividedBy(new BigNumber(entry.price))
            .decimalPlaces(6)
            .toNumber(),
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
    await sleep(0.8)
    placeMarketOrderMutation.reset()
    await Promise.allSettled([
      queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['market-shares', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['order-book', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['locked-balance', market?.slug],
      }),
    ])
  }

  const noOrdersOnDesiredToken = useMemo(() => {
    if (strategy === 'Buy') {
      if (!outcome) {
        return !Boolean(orderBook?.asks.length)
      }
      if (outcome) {
        return !Boolean(orderBook?.bids.length)
      }
    }
    if (strategy === 'Sell') {
      if (!outcome) {
        return !Boolean(orderBook?.bids.length)
      }
      if (outcome) {
        return !Boolean(orderBook?.asks.length)
      }
    }
    return false
  }, [orderBook, outcome, strategy])

  const handleSubmitButtonClicked = async () => {
    if (strategy === 'Buy') {
      const isApprovalNeeded = new BigNumber(allowance.toString()).isLessThan(
        parseUnits(sharesPrice, market?.collateralToken.decimals || 6).toString()
      )
      if (isApprovalNeeded && client === 'eoa') {
        onToggleTradeStepper()
        return
      }
      await placeMarketOrderMutation.mutateAsync()
      return
    }
    if (!isApprovedForSell && client === 'eoa') {
      onToggleTradeStepper()
      return
    }
    await placeMarketOrderMutation.mutateAsync()
    return
  }

  const maxOrderAmountLessThanInput = useMemo(() => {
    if (strategy === 'Buy' && orderBook) {
      const targetSide = !outcome
        ? orderBook.asks
        : orderBook.bids.map((a) => ({ ...a, price: new BigNumber(1).minus(a.price).toNumber() }))
      const totalAmount = targetSide.reduce((sum, acc) => {
        return new BigNumber(sum)
          .plus(
            new BigNumber(acc.price).multipliedBy(
              new BigNumber(formatUnits(BigInt(acc.size), market?.collateralToken.decimals || 6))
            )
          )
          .toNumber()
      }, 0)
      return new BigNumber(price).isGreaterThan(new BigNumber(totalAmount))
    }
    return false
  }, [price, strategy, orderBook, outcome, market])

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
      <Spacer mt='8px' />
      <NumberInputWithButtons
        id='marketPrice'
        placeholder='Eg. 85¢'
        max={99.9}
        step={1}
        value={price}
        handleInputChange={handleInputValueChange}
        showIncrements={false}
        endAdornment={
          <Text {...paragraphMedium} color={'grey.500'}>
            {strategy === 'Buy' ? market?.collateralToken.symbol : 'Contracts'}
          </Text>
        }
      />
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
            {NumberUtil.toFixed(orderCalculations.payout, 6)} USDC{' '}
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
        isDisabled={
          !+price ||
          isBalanceNotEnough ||
          !web3Wallet ||
          noOrdersOnDesiredToken ||
          maxOrderAmountLessThanInput
        }
        onClick={handleSubmitButtonClicked}
        successText={`${strategy === 'Buy' ? 'Bought' : 'Sold'} ${NumberUtil.toFixed(
          orderCalculations.contracts,
          6
        )} contracts`}
        onReset={onResetMutation}
      >
        {strategy} {outcome ? 'No' : 'Yes'}
      </ClobTradeButton>
      {!+price && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Enter amount to {strategy === 'Buy' ? 'buy' : 'sell'}
        </Text>
      )}
      {maxOrderAmountLessThanInput && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Amount exceeds order book size
        </Text>
      )}
    </>
  )
}
