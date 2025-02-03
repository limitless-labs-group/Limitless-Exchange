import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import OrderbookTableLarge from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-large'
import OrderBookTableSmall from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-small'
import { Order, useOrderBook } from '@/hooks/use-order-book'
import { useTradingService } from '@/services'

interface OrderBookProps {
  variant?: 'small' | 'large'
}

export default function Orderbook({ variant }: OrderBookProps) {
  const [orderbookSide, setOrderbookSide] = useState(0)
  const { market } = useTradingService()
  const { data: orderbook } = useOrderBook(market?.slug)

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
      .reverse()
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
          cumulativePercent: cumulativePercent.toFixed(2),
          percent: cumulativePercent.toFixed(2),
          cumulativePrice: cumulativeSum.toFixed(2),
        }
      })
      .reverse()
    return processedBids
  }

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
        cumulativePercent: cumulativePercent.toFixed(2),
        cumulativePrice: cumulativePrice.toFixed(2),
      }
    })
  }

  const getOrderBookData = useCallback(() => {
    if (!orderbook) {
      return {
        bids: [],
        asks: [],
      }
    }

    const bids = orderbookSide
      ? orderbook.asks
          .map((ask) => {
            return {
              ...ask,
              price: +new BigNumber(1).minus(new BigNumber(ask.price)).toFixed(2),
            }
          })
          .sort((a, b) => a.price - b.price)
      : orderbook.bids.sort((a, b) => a.price - b.price)

    const asks = orderbookSide
      ? orderbook.bids
          .map((bid) => {
            return {
              ...bid,
              price: +new BigNumber(1).minus(new BigNumber(bid.price)).toFixed(2),
            }
          })
          .sort((a, b) => b.price - a.price)
      : orderbook.asks.sort((a, b) => b.price - a.price)
    return {
      bids: calculatePercent(bids),
      asks: calculatePercentReverse(asks),
    }
  }, [orderbook, orderbookSide])

  const spread = useMemo(() => {
    if (!getOrderBookData()) {
      return '0'
    }
    if (!getOrderBookData().asks.length || !getOrderBookData().bids.length) {
      return '0'
    }
    return new BigNumber(
      Math.abs(
        new BigNumber(getOrderBookData().asks.reverse()[0].price)
          .minus(new BigNumber(getOrderBookData().bids[0].price))
          .toNumber()
      ) * 100
    ).toFixed(0)
  }, [getOrderBookData])

  const lastPrice = useMemo(() => {
    if (!orderbook?.lastTradePrice) {
      return ''
    }
    if (orderbook && market) {
      const tradedToken = orderbook.tokenId === market.tokens.yes ? 'yes' : 'no'
      if (!orderbookSide) {
        return tradedToken === 'yes'
          ? new BigNumber(orderbook.lastTradePrice).multipliedBy(100).toString()
          : new BigNumber(1).minus(orderbook.lastTradePrice).multipliedBy(100).toString()
      }
      return tradedToken === 'no'
        ? new BigNumber(orderbook.lastTradePrice).multipliedBy(100).toString()
        : new BigNumber(1).minus(orderbook.lastTradePrice).multipliedBy(100).toString()
    }
    return ''
  }, [orderbook, market, orderbookSide])

  return isMobile || variant === 'small' ? (
    <OrderBookTableSmall
      setOrderbookSide={setOrderbookSide}
      orderbookSide={orderbookSide}
      orderBookData={getOrderBookData()}
      spread={spread}
      lastPrice={lastPrice}
    />
  ) : (
    <OrderbookTableLarge
      setOrderbookSide={setOrderbookSide}
      orderbookSide={orderbookSide}
      orderBookData={getOrderBookData()}
      spread={spread}
      lastPrice={lastPrice}
    />
  )
}
