import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { isNumber } from '@chakra-ui/utils'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useFundWallet } from '@privy-io/react-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import BigNumber from 'bignumber.js'
import { useAtom } from 'jotai'
import Cookies from 'js-cookie'
import React, { useMemo } from 'react'
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
import usePrivySendTransaction from '@/hooks/use-smart-wallet-service'
import {
  ClickEvent,
  useAccount,
  useAmplitude,
  useBalanceService,
  useTradingService,
} from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { PendingTradeData } from '@/services/PendingTradeService'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import { BLOCKED_REGION, TRADING_BLOCKED_MSG } from '@/utils/consts'
import { getOrderErrorText } from '@/utils/orders'

export default function ClobLimitTradeForm() {
  const priceInputRef = React.useRef<HTMLInputElement>(null)
  const contractsInputRef = React.useRef<HTMLInputElement>(null)
  const { balanceLoading } = useBalanceService()
  const {
    balance,
    allowance,
    sharesPrice,
    isApprovedForSell,
    onToggleTradeStepper,
    isBalanceNotEnough,
    setSharesAmount,
    setPrice,
    price,
    sharesAmount,
    sharesAvailable,
    isApprovedNegRiskForSell,
    orderType,
  } = useClobWidget()
  const { trackClicked } = useAmplitude()
  const { web3Wallet, loginToPlatform, profileLoading } = useAccount()
  const { market, strategy, clobOutcome: outcome } = useTradingService()
  const queryClient = useQueryClient()
  const { client, placeLimitOrder } = useWeb3Service()
  const { web3Client, profileData, account } = useAccount()
  const privyService = usePrivySendTransaction()
  const privateClient = useAxiosPrivateClient()
  const toast = useToast()

  const { pushGA4Event } = useGoogleAnalytics()
  const { fundWallet } = useFundWallet()
  const country = Cookies.get('limitless_geo')

  const [tradingBlocked, setTradingBlocked] = useAtom(blockTradeAtom)

  const maxSharesAvailable =
    strategy === 'Sell'
      ? +formatUnits(sharesAvailable[outcome ? 'no' : 'yes'], market?.collateralToken.decimals || 6)
      : undefined

  const handlePercentButtonClicked = (value: number) => {
    trackClicked(ClickEvent.TradingWidgetPricePrecetChosen, {
      amount: value,
      marketAddress: market?.slug,
      marketType: market?.marketType,
      marketTags: market?.tags,
      marketMakerType: 'CLOB',
      assetType: 'contracts',
    })
    const sharesAmount = outcome
      ? formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6)
      : formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6)
    if (value === 100) {
      setSharesAmount(sharesAmount)
      return
    }
    const amountByPercent = (Number(sharesAmount) * value) / 100
    setSharesAmount((+amountByPercent).toFixed(2))
    return
  }

  const handleFocusPriceInput = () => {
    if ((isMobile || isTablet) && priceInputRef.current) {
      setTimeout(() => {
        priceInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
  }

  const handleFocusAmountInput = () => {
    if ((isMobile || isTablet) && contractsInputRef.current) {
      setTimeout(() => {
        contractsInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
  }

  const isLessThanMinTreshHold = useMemo(() => {
    if (price && sharesAmount) {
      return +sharesAmount < 5
    }
    return false
  }, [price, sharesAmount])

  const placeLimitOrderMutation = useMutation({
    mutationKey: ['limit-order', market?.slug, price],
    mutationFn: async () => {
      trackClicked(ClickEvent.ConfirmTransactionClicked, {
        address: market?.slug,
        outcome: outcome,
        strategy,
        walletType: web3Client,
        marketType: market?.marketType,
        marketMakerType: 'ClOB',
        tradingMode: 'limit order',
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
        const signedOrder = await placeLimitOrder(
          tokenId,
          market.collateralToken.decimals,
          price,
          sharesAmount,
          side,
          market.negRiskRequestId ? 'negRisk' : 'common',
          market.metadata.fee
        )
        const data = {
          order: {
            ...signedOrder,
            salt: +signedOrder.salt,
            price: new BigNumber(price).dividedBy(100).toNumber(),
            makerAmount: +signedOrder.makerAmount,
            takerAmount: +signedOrder.takerAmount,
            nonce: +signedOrder.nonce,
            feeRateBps: +signedOrder.feeRateBps,
          },
          ownerId: profileData?.id,
          orderType: 'GTC',
          marketSlug: market.slug,
        }
        return privateClient.post('/orders', data)
      }
    },
    onSuccess: async () => {
      pushGA4Event(GAEvents.ClickBuyOrder)
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

  const renderButtonContent = (title: number) => {
    if (title === 100) {
      if (isMobile) {
        return 'MAX'
      }
      const balanceToShow = outcome
        ? NumberUtil.formatThousands(
            formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6),
            2
          )
        : NumberUtil.formatThousands(
            formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6),
            2
          )
      return `${balanceToShow}`
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
      return (
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
      )
    }
  }, [balanceLoading, strategy, renderButtonContent])

  const orderCalculations = useMemo(() => {
    if (!+price || !+sharesAmount) {
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
        payout: new BigNumber(sharesAmount).toNumber(),
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
    await sleep(1)
    placeLimitOrderMutation.reset()
    await Promise.allSettled([
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
        queryKey: ['user-orders', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['positions'],
      }),
      queryClient.refetchQueries({
        queryKey: ['market-page-clob-feed', market?.slug],
      }),
    ])
  }

  const shouldSignUp = !web3Wallet

  const shouldAddFunds =
    web3Wallet && strategy === 'Buy' && orderCalculations.total > Number(balance)

  const disableButton = useMemo(() => {
    if (shouldSignUp) {
      return false
    }
    if (shouldAddFunds) {
      return false
    }
    return (
      !+price || isLessThanMinTreshHold || !+sharesAmount || isBalanceNotEnough || tradingBlocked
    )
  }, [
    isBalanceNotEnough,
    shouldSignUp,
    shouldAddFunds,
    price,
    isLessThanMinTreshHold,
    sharesAmount,
    tradingBlocked,
  ])

  const handleSubmitButtonClicked = async () => {
    if (shouldSignUp) {
      const currentUrl = window.location

      const routeInfo: PendingTradeData = {
        price,
        sharesAmount,
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
      const isApprovalNeeded = new BigNumber(allowance.toString()).isLessThan(
        parseUnits(sharesPrice, market?.collateralToken.decimals || 6).toString()
      )
      if (isApprovalNeeded && client === 'eoa') {
        onToggleTradeStepper()
        return
      }
      await placeLimitOrderMutation.mutateAsync()
      return
    }
    if (client === 'eoa') {
      console.log(
        `limit trade form isApprovedForSell ${isApprovedForSell} isApprovedNegRiskForSell ${isApprovedNegRiskForSell}`
      )
      const isApprovedSell = market?.negRiskRequestId
        ? isApprovedForSell && isApprovedNegRiskForSell
        : isApprovedForSell
      if (!isApprovedSell) {
        onToggleTradeStepper()
        return
      }
    }
    await placeLimitOrderMutation.mutateAsync()
  }

  const handleSetLimitPrice = (val: string) => {
    const decimals = val.split('.')[1] || val.split(',')[1]
    if (decimals && decimals.length > 1) {
      return
    }
    if (+val > 100) {
      return
    }
    setPrice(val)
  }

  const handleSetLimitShares = (val: string) => {
    const decimals = val.split('.')[1] || val.split(',')[1]
    if (decimals && decimals.length > 2) {
      return
    }
    setSharesAmount(val)
  }

  const getButtonText = () => {
    if (tradingBlocked) {
      return TRADING_BLOCKED_MSG
    }
    if (shouldSignUp) {
      return `Sign up to ${strategy}`
    }
    if (shouldAddFunds) {
      return 'Add funds to place order'
    }
    return `${strategy} ${outcome ? 'No' : 'Yes'}`
  }

  return (
    <>
      <Flex justifyContent='space-between' alignItems='center' mb='8px'>
        <Text {...paragraphMedium} color={'grey.500'} lineHeight='20px'>
          Limit price
        </Text>
        {showBuyBalance}
      </Flex>
      <NumberInputWithButtons
        ref={priceInputRef}
        id='limitPrice'
        symbol='¢'
        placeholder='Eg. 85¢'
        max={99.9}
        step={0.1}
        value={price}
        handleInputChange={handleSetLimitPrice}
        showIncrements={true}
        inputType='number'
        onFocus={handleFocusPriceInput}
      />
      <Flex justifyContent='space-between' alignItems='center' mt='16px' mb='8px'>
        <Text {...paragraphMedium} color={'grey.500'} userSelect='none' lineHeight='21px'>
          Contracts
        </Text>
        {showSellBalance}
      </Flex>
      <NumberInputWithButtons
        ref={contractsInputRef}
        id='contractsAmount'
        step={1}
        max={isNumber(maxSharesAvailable) ? maxSharesAvailable : undefined}
        placeholder='Eg. 32'
        value={sharesAmount}
        handleInputChange={handleSetLimitShares}
        isInvalid={isBalanceNotEnough}
        showIncrements={true}
        inputType='number'
        onFocus={handleFocusAmountInput}
      />
      <VStack w='full' gap='8px' my='24px'>
        {strategy === 'Buy' ? (
          <>
            <HStack w='full' justifyContent='space-between'>
              <Text {...paragraphMedium} color='grey.500' userSelect='none'>
                Cost
              </Text>
              <Text
                {...paragraphMedium}
                color={!orderCalculations.total ? 'grey.500' : 'grey.800'}
                userSelect='none'
              >
                {NumberUtil.toFixed(orderCalculations.total, 6)} {market?.collateralToken.symbol}
              </Text>
            </HStack>
            <HStack w='full' justifyContent='space-between'>
              <Text {...paragraphMedium} color='grey.500' userSelect='none'>
                Payout if {outcome ? 'No' : 'Yes'} wins
              </Text>
              <Text
                {...paragraphMedium}
                color={!orderCalculations.payout ? 'grey.500' : 'grey.800'}
                userSelect='none'
              >
                {NumberUtil.toFixed(orderCalculations.payout, 6)} {market?.collateralToken.symbol}
                {Boolean(orderCalculations.profit) && (
                  <Text color='green.500' as='span' userSelect='none'>
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
              <Text {...paragraphMedium} color='grey.500' userSelect='none'>
                Profit
              </Text>
              <Text
                {...paragraphMedium}
                color={!orderCalculations.payout ? 'grey.500' : 'grey.800'}
                userSelect='none'
              >
                {NumberUtil.toFixed(orderCalculations.payout, 6)} {market?.collateralToken.symbol}
              </Text>
            </HStack>
          </>
        )}
      </VStack>
      {profileLoading ? (
        <Box w='full'>
          <Skeleton height={64} />
        </Box>
      ) : (
        <ClobTradeButton
          status={placeLimitOrderMutation.status}
          isDisabled={disableButton}
          isBlocked={tradingBlocked}
          onClick={handleSubmitButtonClicked}
          successText={`Submitted`}
          onReset={onResetMutation}
        >
          {getButtonText()}
        </ClobTradeButton>
      )}
      {(!price || !sharesAmount) && (
        <Flex
          {...paragraphRegular}
          mt='8px'
          color='grey.500'
          textAlign='center'
          justifyContent='center'
        >
          <Text>Set</Text>
          <Text
            borderBottom='1px dotted'
            borderColor='grey.500'
            display='inline'
            cursor='pointer'
            onClick={() => priceInputRef.current?.focus()}
          >
            {!+price && '\u00A0Limit price'}
          </Text>
          {!+price && !+sharesAmount ? ',' : ''}
          <Text
            borderBottom='1px dotted'
            borderColor='grey.500'
            display='inline'
            cursor='pointer'
            onClick={() => contractsInputRef.current?.focus()}
          >
            {!+sharesAmount && '\u00A0Contracts'}
          </Text>
        </Flex>
      )}
      {isLessThanMinTreshHold && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Min. 5 shares
        </Text>
      )}
      {isLessThanMinTreshHold && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Min. amount is $1
        </Text>
      )}
      {shouldAddFunds && <AddFundsValidation />}
      {isLessThanMinTreshHold && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Min. shares amount is 5
        </Text>
      )}
    </>
  )
}
