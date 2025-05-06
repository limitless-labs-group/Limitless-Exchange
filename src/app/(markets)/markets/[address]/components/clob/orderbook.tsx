import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import OrderbookTableLarge from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-large'
import OrderBookTableSmall from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-small'
import { Order, useOrderBook } from '@/hooks/use-order-book'
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

  function calculatePercentReverse(array: Order[]) {
    const totalSum = array.reduce(
      (sum, bid) =>
        sum +
        new BigNumber(formatUnits(BigInt(bid.size), market?.collateralToken.decimals || 6))
          .multipliedBy(bid.price)
          .toNumber(),
      0
    )

    let cumulativeSum = 0
    const processedBids = array
      .slice()
      .map((order) => {
        const bidSum = new BigNumber(
          formatUnits(BigInt(order.size), market?.collateralToken.decimals || 6)
        )
          .multipliedBy(order.price)
          .toNumber()
        cumulativeSum += bidSum
        const cumulativePercent = (cumulativeSum / totalSum) * 100

        return {
          ...order,
          cumulativePercent: cumulativePercent.toFixed(6),
          percent: cumulativePercent.toFixed(6),
          cumulativePrice: cumulativeSum.toFixed(6),
        }
      })
      .reverse()
    return processedBids
  }

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

  function calculatePercent(array: Order[]) {
    const totalSize = array.reduce((sum, item) => sum + item.size, 0)
    let cumulativePrice = 0

    let cumulativePercent = 0
    return array.map((item) => {
      const percent = (item.size / totalSize) * 100
      cumulativePercent += percent
      cumulativePrice += new BigNumber(
        formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6)
      )
        .multipliedBy(item.price)
        .toNumber()
      return {
        ...item,
        percent: percent.toFixed(2),
        cumulativePercent: cumulativePercent.toFixed(6),
        cumulativePrice: cumulativePrice.toFixed(6),
      }
    })
  }

  const orderbookData = useMemo(() => {
    if (!orderbook) {
      return {
        bids: [],
        asks: [],
      }
    }

    const bids = outcome
      ? orderbook.asks
          .map((ask) => {
            return {
              ...ask,
              price: +new BigNumber(1).minus(new BigNumber(ask.price)),
            }
          })
          .sort((a, b) => a.price - b.price)
      : orderbook.bids.sort((a, b) => a.price - b.price)

    const asks = outcome
      ? orderbook.bids.map((bid) => {
          return {
            ...bid,
            price: +new BigNumber(1).minus(new BigNumber(bid.price)),
          }
        })
      : orderbook.asks
    return {
      bids: calculatePercent(bids.reverse()),
      asks: calculatePercentReverse(asks),
    }
  }, [orderbook, outcome])

  const spread = useMemo(() => {
    if (!orderbookData) {
      return '0'
    }
    if (!orderbookData.asks.length || !orderbookData.bids.length) {
      return '0'
    }
    return new BigNumber(orderbookData.asks.reverse()[0].price)
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
