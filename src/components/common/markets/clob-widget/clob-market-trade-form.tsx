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
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits, parseUnits } from 'viem'
import ClobTradeButton from '@/components/common/markets/clob-widget/clob-trade-button'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import TradeWidgetSkeleton, {
  SkeletonType,
} from '@/components/common/skeleton/trade-widget-skeleton'
import { useOrderBook } from '@/hooks/use-order-book'
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
  const { market, strategy } = useTradingService()
  const { data: orderBook } = useOrderBook(market?.slug)
  const { placeMarketOrder } = useWeb3Service()
  const { profileData } = useAccount()
  const queryClient = useQueryClient()
  const { setPrice, price, outcome, balance } = useClobWidget()
  const privateClient = useAxiosPrivateClient()

  const handlePercentButtonClicked = (value: number) => {
    trackClicked(ClickEvent.TradingWidgetPricePrecetChosen, {
      amount: value,
      marketAddress: market?.slug,
      marketType: market?.marketType,
      marketTags: market?.tags,
    })
    if (value == 100) {
      setPrice(NumberUtil.toFixed(balance, market?.collateralToken.symbol === 'USDC' ? 1 : 6))
      return
    }
    const amountByPercent = (Number(balance) * value) / 100
    setPrice(NumberUtil.toFixed(amountByPercent, market?.collateralToken.symbol === 'USDC' ? 1 : 6))
  }

  const handleInputValueChange = (value: string) => {
    if (market?.collateralToken.symbol === 'USDC') {
      const decimals = value.split('.')[1]
      if (decimals && decimals.length > 1) {
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
      return `MAX: ${
        balanceLoading ? (
          <Box w='90px'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        ) : (
          NumberUtil.formatThousands(balance, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
        )
      } ${market?.collateralToken.symbol}`
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
      let remainingAmount = +price
      let totalContracts = 0
      let totalCost = 0
      let totalProfit = 0

      const targetArray = outcome ? orderBook.bids : orderBook.asks

      for (const entry of targetArray) {
        const contractPrice = entry.price
        const maxContractsForSize = +formatUnits(
          BigInt(entry.size),
          market.collateralToken.decimals
        )
        const affordableContracts = Math.min(remainingAmount / contractPrice, maxContractsForSize)

        totalContracts += affordableContracts
        remainingAmount -= affordableContracts * contractPrice
        totalCost += affordableContracts * contractPrice
        totalProfit += new BigNumber(affordableContracts)
          .multipliedBy(new BigNumber(1).minus(new BigNumber(contractPrice)))
          .toNumber()

        if (remainingAmount <= 0) break
      }

      const averagePrice = totalContracts > 0 ? totalCost / totalContracts : 0

      return {
        contracts: totalContracts,
        avgPrice: averagePrice,
        payout: totalContracts,
        profit: totalProfit,
      }
    }
    return {
      contracts: 0,
      avgPrice: 0,
      payout: 0,
      profit: 0,
    }
  }, [market, orderBook, outcome, price, strategy])

  const { yesPrice, noPrice } = useMemo(() => {
    if (orderBook) {
      if (strategy === 'Buy') {
        const yesPrice = orderBook?.asks.sort((a, b) => a.price - b.price)[0]?.price * 100
        const noPrice = (1 - orderBook?.bids.sort((a, b) => b.price - a.price)[0]?.price) * 100
        return {
          yesPrice: isNaN(yesPrice) ? 0 : +yesPrice.toFixed(),
          noPrice: isNaN(noPrice) ? 0 : +noPrice.toFixed(),
        }
      }
      const yesPrice = orderBook?.bids.sort((a, b) => b.price - a.price)[0]?.price * 100
      const noPrice = (1 - orderBook?.asks.sort((a, b) => b.price - a.price)[0]?.price) * 100
      return {
        yesPrice: isNaN(yesPrice) ? 0 : +yesPrice.toFixed(),
        noPrice: isNaN(noPrice) ? 0 : +noPrice.toFixed(),
      }
    }
    return {
      yesPrice: 0,
      noPrice: 0,
    }
  }, [strategy, orderBook])

  const placeMarketOrderMutation = useMutation({
    mutationKey: ['market-order', market?.address, price],
    mutationFn: async () => {
      if (market) {
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
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      })
      setPrice('')
    },
  })

  console.log(orderCalculations)

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
      <InputGroup display='block' mt={isMobile ? '16px' : '24px'}>
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
        />
        <InputRightElement h='16px' top='8px' right={isMobile ? '8px' : '12px'} w='fit'>
          <Text {...paragraphMedium} color={'grey.500'}>
            {strategy === 'Buy' ? market?.collateralToken.symbol : 'Contracts'}
          </Text>
        </InputRightElement>
      </InputGroup>
      <VStack w='full' gap='8px' my='24px'>
        <HStack w='full' justifyContent='space-between'>
          <Text {...paragraphMedium} color='grey.500'>
            Contracts
          </Text>
          <Text {...paragraphMedium} color={!orderCalculations.contracts ? 'grey.500' : 'grey.800'}>
            {NumberUtil.toFixed(orderCalculations.contracts, 6)}
          </Text>
        </HStack>
        <HStack w='full' justifyContent='space-between'>
          <Text {...paragraphMedium} color='grey.500'>
            Avg. price
          </Text>
          <Text {...paragraphMedium} color={!orderCalculations.avgPrice ? 'grey.500' : 'grey.800'}>
            {NumberUtil.convertWithDenomination(orderCalculations.avgPrice * 100, 6)}¢
          </Text>
        </HStack>
        <HStack w='full' justifyContent='space-between'>
          <Text {...paragraphMedium} color='grey.500'>
            Payout if {outcome ? 'No' : 'Yes'} wins
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
        isDisabled={!price}
        onClick={() => placeMarketOrderMutation.mutateAsync()}
        successText={`Bought ${NumberUtil.convertWithDenomination(
          orderCalculations.contracts
        )} contracts`}
        onReset={async () => placeMarketOrderMutation.reset()}
      >
        {strategy} {outcome ? 'No' : 'Yes'}
      </ClobTradeButton>
      {!price && (
        <Text {...paragraphRegular} mt='8px' color='grey.500' textAlign='center'>
          Enter amount to buy
        </Text>
      )}
    </>
  )
}
