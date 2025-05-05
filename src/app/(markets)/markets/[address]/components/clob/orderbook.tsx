import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import OrderbookTableLarge from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-large'
import OrderBookTableSmall from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-small'
import { getOrderBookData } from '@/app/(markets)/markets/[address]/utils'
import { useOrderBook } from '@/hooks/use-order-book'
import { useTradingService } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

interface OrderBookProps {
  variant?: 'small' | 'large'
}

export default function Orderbook({ variant }: OrderBookProps) {
  const { clobOutcome: outcome } = useTradingService()
  const { market } = useTradingService()
  const { data: orderbook } = useOrderBook(market?.slug, market?.tradeType)
  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()

  const deleteBatchOrders = useMutation({
    mutationKey: ['delete-batch-orders'],
    mutationFn: async ({ orders }: { orders: string[] }) => {
      await privateClient.post('/orders/cancel-batch', {
        orderIds: orders,
      })
    },
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.refetchQueries({
          queryKey: ['user-orders', market?.slug],
        }),
        queryClient.refetchQueries({
          queryKey: ['order-book', market?.slug],
        }),
        queryClient.refetchQueries({
          queryKey: ['locked-balance', market?.slug],
        }),
      ])
    },
  })

  const orderbookData = getOrderBookData(outcome, orderbook, market?.collateralToken.decimals)

  const spread = useMemo(() => {
    if (!orderbookData) {
      return '0'
    }
    if (!orderbookData.asks.length || !orderbookData.bids.length) {
      return '0'
    }
    return new BigNumber(orderbookData.asks[0].price)
      .minus(new BigNumber(orderbookData.bids[0].price))
      .multipliedBy(100)
      .abs()
      .decimalPlaces(1)
      .toFixed()
  }, [orderbookData])

  const lastPrice = useMemo(() => {
    if (!orderbook?.lastTradePrice) {
      return ''
    }
    if (orderbook && market) {
      const tradedToken = orderbook.tokenId === market.tokens.yes ? 'yes' : 'no'
      if (!outcome) {
        return tradedToken === 'no'
          ? new BigNumber(1)
              .minus(orderbook.lastTradePrice)
              .multipliedBy(100)
              .decimalPlaces(1)
              .toString()
          : new BigNumber(orderbook.lastTradePrice).multipliedBy(100).decimalPlaces(1).toString()
      }
      return tradedToken === 'yes'
        ? new BigNumber(1)
            .minus(orderbook.lastTradePrice)
            .multipliedBy(100)
            .decimalPlaces(1)
            .toString()
        : new BigNumber(orderbook.lastTradePrice).multipliedBy(100).decimalPlaces(1).toString()
    }
    return ''
  }, [orderbook, market, outcome])

  console.log(orderbookData)

  return isMobile || variant === 'small' ? (
    <OrderBookTableSmall
      orderBookData={orderbookData}
      spread={spread}
      lastPrice={lastPrice}
      deleteBatchOrders={deleteBatchOrders}
    />
  ) : (
    <OrderbookTableLarge
      orderBookData={orderbookData}
      spread={spread}
      lastPrice={lastPrice}
      deleteBatchOrders={deleteBatchOrders}
    />
  )
}
