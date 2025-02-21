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
import useGoogleAnalytics, { Purchase } from '@/services/GoogleAnalytics'
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
  const { pushPuchaseEvent } = useGoogleAnalytics()

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
        const response = await privateClient.post('/orders', data)
        if (!response?.data) {
          console.log('Failed to place order')
          return
        }
        return response.data
      }
    },
    onSuccess: async (res: { id: string }) => {
      const validatePurchase = (data: Purchase): boolean => {
        if (!data.transaction_id || typeof data.transaction_id !== 'string') return false
        if (typeof data.currency !== 'string') return false
        if (!Array.isArray(data.items) || data.items.length === 0) return false

        return data.items.every(
          (item) =>
            typeof item.item_id === 'string' &&
            typeof item.item_name === 'string' &&
            item.item_category === 'Deposit' &&
            typeof item.quantity === 'string'
        )
      }

      const purchase: Purchase = {
        transaction_id: res.id,
        value: String(orderCalculations.payout),
        currency: market?.collateralToken.symbol || 'USDC',
        items: [
          {
            item_id: market?.marketType || '',
            item_name: outcome ? 'Yes shares' : 'No shares',
            item_category: 'Deposit',
            price: String(orderCalculations.avgPrice),
            quantity: String(price),
          },
        ],
      }

      if (!validatePurchase(purchase)) {
        console.error('Invalid purchase object:', purchase)
        return
      }
      pushPuchaseEvent(purchase)
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
// {
//   transaction_id: res.id,
//   value: '',
//   currency: res.market.token.name,
//   items: [
//     {
//       item_id: res.market.draftMetadata.type,
//       item_name: res.side === 0 ? "No shares" ? 'Yes shares',
//       item_category: 'Deposit',
//       price: '',
//       quantity: res.makerAmount/market.token.decimals,
//     }
//   ]
// }

const order = {
  makerAmount: 10000, //0.01 amount
  takerAmount: 1,
  signatureType: 0,
  salt: 1443672609311,
  maker: '0x55257A9a03601B0587Ab4752FD42A87c4Bad2e1e',
  signer: '0x55257A9a03601B0587Ab4752FD42A87c4Bad2e1e',
  taker: '0x0000000000000000000000000000000000000000',
  tokenId: '68520924636569036729435566371810702949677811144178366358503944533896399577010',
  side: 0,
  nonce: 0,
  signature:
    '0x6d1c4ec4971f6a4aa2d25b6cc36c5208760b26faeb017f2d845323b82364d6846bc93d1e726a50c2b9684bdb4c39122641f0a8c25f55834f40c6a1be463727521b',
  orderType: 'FOK',
  market: {
    createdAt: '2025-02-17T17:39:52.603Z',
    id: 2608,
    address: null,
    title: '💎 Ripple above $2.70 on February 21?',
    proxyTitle: null,
    description:
      '<p>This market will resolve to "Yes" if the Binance 1 minute candle for XRPUSDT 21 Feb \'25 12:00 in the ET timezone (noon) has a final “Close” price of 2.70001 or higher. Otherwise, this market will resolve to "No".</p><p><br></p><p>The resolution source for this market is Binance, specifically the XRPUSDT "Close" prices currently available at&nbsp;<a href="https://www.binance.com/en/trade/XRP_USDT" rel="noopener noreferrer" target="_blank">https://www.binance.com/en/trade/XRP_USDT</a>&nbsp;with “1m” and “Candles” selected on the top bar.</p><p><br></p><p>Please note that this market is about the price according to Binance XRPUSDT, not according to other sources or spot markets.</p>',
    questionId: '0x0ee17c3b135353640ce63a008f268faf39c95017fa56df90219edd10edc9cbc3',
    conditionId: '0xcc343ad389593f8ec162e4d4e7402f0b7a6637419ce44e61bcf8d1de7bef9f93',
    outcomeSlotCount: 2,
    winningIndex: null,
    payoutNumerators: null,
    status: 'FUNDED',
    ogUrl: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/2608/og.jpg',
    imageUrl: null,
    deadline: '2025-02-21T17:00:00.000Z',
    hidden: false,
    txHash: null,
    resolutionTxHash: null,
    draftMetadata: {
      fee: 0,
      type: 'clob',
    },
    slug: 'ripple-above-dollar270-on-february-21-1739815556116',
    yesPositionId: '68520924636569036729435566371810702949677811144178366358503944533896399577010',
    noPositionId: '52641025126452605592415938481923444032002020823653638988901711495502408856356',
    priorityIndex: 0,
    metadata: {
      isBannered: false,
    },
    category: {
      id: 2,
      name: 'Crypto',
      priority: 7,
    },
    creator: {
      id: 1,
      account: '0x60e61631d9a585797cDee9f79FafDecf3bd7F64D',
      username: 'Limitless',
      displayName: 'Limitless',
      bio: null,
      client: 'eoa',
      pfpUrl: 'https://limitless.exchange/assets/images/logo.svg',
      smartWallet: null,
      isCreator: true,
      isAdmin: false,
      socialUrl: 'https://x.com/trylimitless',
    },
    token: {
      id: 7,
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      priceOracleId: 'usd-coin',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
    },
    tags: [
      {
        createdAt: '2024-08-30T22:11:35.830Z',
        id: 149,
        name: 'Daily',
      },
    ],
    marketsGroup: null,
  },
  owner: {
    id: 473,
    account: '0x55257A9a03601B0587Ab4752FD42A87c4Bad2e1e',
    username: '0x55257A9a03601B0587Ab4752FD42A87c4Bad2e1e',
    displayName: '0x55257',
    bio: '',
    client: 'eoa',
    pfpUrl: null,
    smartWallet: null,
    isCreator: false,
    isAdmin: false,
    socialUrl: null,
  },
  expiration: null,
  feeRateBps: null,
  price: null,
  createdAt: '2025-02-21T13:34:52.221Z',
  id: '93135c67-3930-47c3-9f40-ceaca6b8fa35',
}
