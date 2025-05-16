import { Box, Button, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useFundWallet } from '@privy-io/react-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import BigNumber from 'bignumber.js'
import { useAtom } from 'jotai'
import Cookies from 'js-cookie'
import React, { useMemo, useRef, useState } from 'react'
import { isMobile, isTablet } from 'react-device-detect'
import { Address, formatUnits, maxUint256, parseUnits } from 'viem'
import ClobTradeButton from '@/components/common/markets/clob-widget/clob-trade-button'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import NumberInputWithButtons from '@/components/common/number-input-with-buttons'
import Skeleton from '@/components/common/skeleton'
import TradeWidgetSkeleton, {
  SkeletonType,
} from '@/components/common/skeleton/trade-widget-skeleton'
import { Toast } from '@/components/common/toast'
import { AddFundsValidation } from './add-funds-validation'
import { blockTradeAtom } from '@/atoms/trading'
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
import useGoogleAnalytics, { GAEvents, Purchase } from '@/services/GoogleAnalytics'
import { PendingTradeData } from '@/services/PendingTradeService'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import { BLOCKED_REGION, TRADING_BLOCKED_MSG } from '@/utils/consts'
import { getOrderErrorText } from '@/utils/orders'

export default function ClobMarketTradeForm() {
  const { balanceLoading } = useBalanceService()
  const { trackClicked } = useAmplitude()
  const { market, strategy, clobOutcome: outcome } = useTradingService()
  const { data: orderBook, isLoading: isOrderBookLoading } = useOrderBook(
    market?.slug,
    market?.tradeType
  )
  const queryClient = useQueryClient()
  const { web3Client, profileData, web3Wallet, loginToPlatform, account, profileLoading } =
    useAccount()
  const {
    balance,
    allowance,
    isApprovedForSell,
    onToggleTradeStepper,
    sharesPrice,
    isBalanceNotEnough,
    yesPrice,
    noPrice,
    setPrice,
    price,
    sharesAvailable,
    isApprovedNegRiskForSell,
    orderType,
  } = useClobWidget()
  const { client, placeMarketOrder } = useWeb3Service()
  const privyService = usePrivySendTransaction()
  const privateClient = useAxiosPrivateClient()
  const toast = useToast()
  const { pushPuchaseEvent, pushGA4Event } = useGoogleAnalytics()
  const [contractsBuying, setContractsBuying] = useState('')
  const { fundWallet } = useFundWallet()

  const [tradingBlocked, setTradingBlocked] = useAtom(blockTradeAtom)
  const country = Cookies.get('limitless_geo')

  const inputRef = useRef<HTMLInputElement | null>(null)

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

  const placeMarketOrderMutation = useMutation({
    mutationKey: ['market-order', market?.slug, price],
    mutationFn: async () => {
      setContractsBuying(orderCalculations.contracts.toString())
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
            const operator = market.negRiskRequestId
              ? process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
              : process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR
            await privyService.approveConditionalIfNeeded(
              operator as Address,
              process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
            )
            if (market.negRiskRequestId) {
              await privyService.approveConditionalIfNeeded(
                process.env.NEXT_PUBLIC_NEGRISK_CTF_EXCHANGE as Address,
                process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
              )
            }
          } else {
            const spender = market.negRiskRequestId
              ? process.env.NEXT_PUBLIC_NEGRISK_CTF_EXCHANGE
              : process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR
            await privyService.approveCollateralIfNeeded(
              spender as Address,
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
          price,
          market.negRiskRequestId ? 'negRisk' : 'common',
          market.metadata.fee
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
        const response = await privateClient.post('/orders', data)
        if (!response?.data) {
          console.log('Failed to place order')
          return
        }
        return response.data
      }
    },
    onSuccess: async (res: { id: string }) => {
      const purchase: Purchase = {
        transaction_id: res.id,
        value: orderCalculations.payout,
        currency:
          market?.collateralToken.symbol === 'USDC'
            ? 'USD'
            : market?.collateralToken.symbol ?? 'USD',
        items: [
          {
            item_id: market?.marketType || '',
            item_name: outcome ? 'Bet No' : 'Bet Yes',
            item_category: 'Bet Order',
            price: orderCalculations.avgPrice,
            quantity: +price,
          },
        ],
      }
      pushPuchaseEvent(purchase)
    },
    onError: async (error: AxiosError<{ message: string }>) => {
      const id = toast({
        render: () => (
          <Toast title={getOrderErrorText(error.response?.data.message ?? '')} id={id} />
        ),
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
        setPrice(NumberUtil.toFixed(balance, 2))
        return
      }
      const amountByPercent = (Number(balance) * value) / 100
      setPrice(NumberUtil.toFixed(amountByPercent, 2))
      return
    }
    const sharesAmount = outcome
      ? formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6)
      : formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6)
    if (value === 100) {
      setPrice((+sharesAmount).toFixed(2))
      return
    }
    const amountByPercent = (Number(sharesAmount) * value) / 100
    setPrice(amountByPercent.toFixed(2))
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

  const handleFocus = () => {
    if ((isMobile || isTablet) && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
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
          market?.collateralToken.symbol === 'USDC' ? 2 : 6
        )
      } else {
        balanceToShow = outcome
          ? NumberUtil.formatThousands(
              formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6),
              2
            )
          : NumberUtil.formatThousands(
              formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6),
              2
            )
      }
      return `${
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

  const isLessThanMinTreshHold = useMemo(() => {
    if (strategy == 'Buy') {
      return +price < 1
    }
    if (orderCalculations.payout) {
      return orderCalculations.payout < 1
    }
    return false
  }, [orderCalculations.payout, strategy])

  const onResetMutation = async () => {
    await sleep(1)
    placeMarketOrderMutation.reset()
    setContractsBuying('')
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
      queryClient.refetchQueries({
        queryKey: ['prices', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['positions'],
      }),
      queryClient.refetchQueries({
        queryKey: ['market-page-clob-feed', market?.slug],
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
    if (orderBook) {
      const targetSide = !outcome
        ? orderBook.bids
        : orderBook.asks.map((a) => ({ ...a, price: new BigNumber(1).minus(a.price).toNumber() }))
      const totalShares = targetSide.reduce((sum, acc) => {
        return new BigNumber(sum)
          .plus(new BigNumber(formatUnits(BigInt(acc.size), market?.collateralToken.decimals || 6)))
          .toNumber()
      }, 0)
      return new BigNumber(price).isGreaterThan(totalShares)
    }
    return false
  }, [price, strategy, orderBook, outcome, market])

  const shouldSignUp = !web3Wallet
  const shouldAddFunds =
    web3Wallet &&
    isBalanceNotEnough &&
    !maxOrderAmountLessThanInput &&
    !isOrderBookLoading &&
    strategy === 'Buy'

  const disableButton = useMemo(() => {
    if (shouldSignUp) {
      return false
    }
    if (shouldAddFunds) {
      return false
    }
    return (
      !+price ||
      isLessThanMinTreshHold ||
      isBalanceNotEnough ||
      noOrdersOnDesiredToken ||
      maxOrderAmountLessThanInput ||
      tradingBlocked
    )
  }, [
    isBalanceNotEnough,
    isLessThanMinTreshHold,
    maxOrderAmountLessThanInput,
    noOrdersOnDesiredToken,
    price,
    shouldAddFunds,
    shouldSignUp,
    tradingBlocked,
  ])

  const handleSubmitButtonClicked = async () => {
    if (shouldSignUp) {
      const currentUrl = window.location

      const routeInfo: PendingTradeData = {
        price,
        marketSlug: market?.slug ?? '',
        strategy,
        outcome,
        orderType,
        pathname: currentUrl.pathname,
        search: currentUrl.search,
        href: currentUrl.href,
        queryParams: Object.fromEntries(new URLSearchParams(currentUrl.search)),
      }
      localStorage.setItem('pendingTrade', JSON.stringify(routeInfo))
      await loginToPlatform()
      return
    }

    if (shouldAddFunds) {
      await fundWallet(account as string)
      return
    }
    if (country === BLOCKED_REGION) {
      setTradingBlocked(true)
      return
    }
    if (strategy === 'Buy') {
      pushGA4Event(GAEvents.ClickBuy)
      const isApprovalNeeded = new BigNumber(allowance.toString()).isLessThan(
        parseUnits(sharesPrice, market?.collateralToken.decimals || 6).toString()
      )
      if (client === 'eoa' && isApprovalNeeded) {
        onToggleTradeStepper()
        return
      }
      await placeMarketOrderMutation.mutateAsync()
      return
    }
    if (client === 'eoa') {
      console.log(
        `market trade form isApprovedForSell ${isApprovedForSell} isApprovedNegRiskForSell ${isApprovedNegRiskForSell}`
      )
      const isApprovedSell = market?.negRiskRequestId
        ? isApprovedForSell || isApprovedNegRiskForSell
        : isApprovedForSell
      if (!isApprovedSell) {
        onToggleTradeStepper()
        return
      }
    }
    await placeMarketOrderMutation.mutateAsync()
    return
  }

  const getButtonText = () => {
    if (tradingBlocked) {
      return TRADING_BLOCKED_MSG
    }
    if (shouldSignUp) {
      return `Sign up to ${strategy}`
    }
    if (shouldAddFunds) {
      return `Add funds to ${strategy}`
    }
    return `${strategy} ${outcome ? 'No' : 'Yes'}`
  }

  return (
    <>
      <Flex justifyContent='space-between' alignItems='center'>
        <Text {...paragraphMedium} color='grey.500'>
          Enter amount
        </Text>
        {balanceLoading ? (
          <Box w='90px'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        ) : (
          <Flex gap='8px'>
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
                  borderColor: 'grey.600',
                  color: 'grey.600',
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
        placeholder='Eg. 85'
        max={99.9}
        step={1}
        value={price}
        handleInputChange={handleInputValueChange}
        showIncrements={false}
        inputType='number'
        endAdornment={
          <Text {...paragraphMedium} color={'grey.500'}>
            {strategy === 'Buy' ? market?.collateralToken.symbol : 'Contracts'}
          </Text>
        }
        ref={inputRef}
        onFocus={handleFocus}
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
      {market?.metadata.fee && (
        <Text {...paragraphRegular} fontSize='12px' color='grey.500' textAlign='center' mb='8px'>
          (This market takes fees)
        </Text>
      )}
      {profileLoading ? (
        <Box w='full'>
          <Skeleton height={64} />
        </Box>
      ) : (
        <ClobTradeButton
          status={placeMarketOrderMutation.status}
          isDisabled={disableButton}
          isBlocked={tradingBlocked}
          onClick={handleSubmitButtonClicked}
          successText={`${strategy === 'Buy' ? 'Bought' : 'Sold'} ${NumberUtil.toFixed(
            contractsBuying,
            6
          )} contracts`}
          onReset={onResetMutation}
        >
          {getButtonText()}
        </ClobTradeButton>
      )}

      {!+price && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Enter amount to {strategy === 'Buy' ? 'buy' : 'sell'}
        </Text>
      )}
      {isLessThanMinTreshHold && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Min. amount is $1
        </Text>
      )}
      {maxOrderAmountLessThanInput && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Amount exceeds order book size
        </Text>
      )}
      {shouldAddFunds && <AddFundsValidation />}
    </>
  )
}
