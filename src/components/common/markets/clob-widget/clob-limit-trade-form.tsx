import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { isNumber } from '@chakra-ui/utils'
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
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function ClobLimitTradeForm() {
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
  } = useClobWidget()
  const { trackClicked } = useAmplitude()
  const { web3Wallet } = useAccount()
  const { market, strategy, clobOutcome: outcome } = useTradingService()
  const queryClient = useQueryClient()
  const { client, placeLimitOrder } = useWeb3Service()
  const { web3Client, profileData } = useAccount()
  const privyService = usePrivySendTransaction()
  const privateClient = useAxiosPrivateClient()
  const toast = useToast()

  const { pushGA4Event } = useGoogleAnalytics()

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
      ? NumberUtil.formatThousands(
          formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6),
          6
        )
      : NumberUtil.formatThousands(
          formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6),
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

  const isLessThanMinTreshHold = useMemo(() => {
    if (price && sharesAmount) {
      const priceBn = new BigNumber(price).dividedBy(100)
      const totalBn = new BigNumber(sharesAmount).multipliedBy(priceBn)
      return totalBn.isLessThan(1)
    }
    return false
  }, [price, sharesAmount, strategy])

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
          market.negRiskRequestId ? 'negRisk' : 'common'
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
      await sleep(1)
      await queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      })
      pushGA4Event(GAEvents.ClickBuyOrder)
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

  const renderButtonContent = (title: number) => {
    if (title === 100) {
      if (isMobile) {
        return 'MAX'
      }
      const balanceToShow = outcome
        ? NumberUtil.formatThousands(
            formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6),
            6
          )
        : NumberUtil.formatThousands(
            formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6),
            6
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
    await sleep(0.8)
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
    ])
    await sleep(2)
    await queryClient.refetchQueries({
      queryKey: ['user-orders', market?.slug],
    })
  }

  const handleSubmitButtonClicked = async () => {
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
    if (decimals && decimals.length > 6) {
      return
    }
    setSharesAmount(val)
  }

  console.log(`price ${+price}`)
  console.log(`sharesAmount ${+sharesAmount}`)
  console.log(`isBalanceNotEnough ${isBalanceNotEnough}`)
  console.log(`web3Wallet ${web3Wallet}`)

  return (
    <>
      <Flex justifyContent='space-between' alignItems='center' mb='8px'>
        <Text {...paragraphMedium} color={'var(--chakra-colors-text-100)'} lineHeight='20px'>
          Limit price
        </Text>
        {showBuyBalance}
      </Flex>
      <NumberInputWithButtons
        id='limitPrice'
        placeholder='Eg. 85¢'
        max={99.9}
        step={0.1}
        value={price}
        handleInputChange={handleSetLimitPrice}
        showIncrements={true}
        inputType='number'
      />
      <Flex justifyContent='space-between' alignItems='center' mt='16px' mb='8px'>
        <Text
          {...paragraphMedium}
          color={'var(--chakra-colors-text-100)'}
          userSelect='none'
          lineHeight='21px'
        >
          Contracts
        </Text>
        {showSellBalance}
      </Flex>
      <NumberInputWithButtons
        id='contractsAmount'
        step={1}
        max={isNumber(maxSharesAvailable) ? maxSharesAvailable : undefined}
        placeholder='Eg. 32'
        value={sharesAmount}
        handleInputChange={handleSetLimitShares}
        isInvalid={isBalanceNotEnough}
        showIncrements={true}
        inputType='number'
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
      <ClobTradeButton
        status={placeLimitOrderMutation.status}
        isDisabled={
          !+price || !+sharesAmount || isBalanceNotEnough || !web3Wallet || isLessThanMinTreshHold
        }
        onClick={handleSubmitButtonClicked}
        successText={`Submitted`}
        onReset={onResetMutation}
      >
        Submit {strategy} Order
      </ClobTradeButton>
      {(!price || !sharesAmount) && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Set {!+price && 'Limit price'}
          {!+price && !+sharesAmount ? ',' : ''} {!+sharesAmount && 'Contracts'}
        </Text>
      )}
      {isLessThanMinTreshHold && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Min. amount is $1
        </Text>
      )}
    </>
  )
}
