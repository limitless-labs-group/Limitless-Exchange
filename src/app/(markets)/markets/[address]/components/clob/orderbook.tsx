import BigNumber from 'bignumber.js'
import React, { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import OrderbookTableLarge from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-large'
import OrderBookTableSmall from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-small'
import { Order, useOrderBook } from '@/hooks/use-order-book'
import { useTradingService } from '@/services'

export default function Orderbook() {
  const [orderbookSide, setOrderbookSide] = useState(0)
  const { market } = useTradingService()
  const { data: orderbook } = useOrderBook(market?.slug)

  function calculatePercent(array: Order[]) {
    const totalSize = array.reduce((sum, item) => sum + item.size, 0) // Total size of the array
    let cumulativePrice = 0

    let cumulativePercent = 0 // Track cumulative percentage
    return array.map((item) => {
      const percent = (item.size / totalSize) * 100 // Percent value
      cumulativePercent += percent // Update cumulative percentage
      cumulativePrice += new BigNumber(
        formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6)
      )
        .multipliedBy(item.price)
        .toNumber()
      return {
        ...item,
        percent: percent.toFixed(2), // Percent relative to total
        cumulativePercent: cumulativePercent.toFixed(2), // Cumulative percent
        cumulativePrice: cumulativePrice.toFixed(2),
      }
    })
  }

  const orderBookData = useMemo(() => {
    if (!orderbook) {
      return {
        bids: [],
        asks: [],
      }
    }

    const bids = orderbookSide
      ? orderbook.asks.map((ask) => {
          return {
            ...ask,
            price: +new BigNumber(1).minus(new BigNumber(ask.price)).toFixed(2),
          }
        })
      : orderbook.bids

    const asks = orderbookSide
      ? orderbook.bids.map((bid) => {
          return {
            ...bid,
            price: +new BigNumber(1).minus(new BigNumber(bid.price)).toFixed(2),
          }
        })
      : orderbook.asks
    return {
      bids: calculatePercent(bids),
      asks: calculatePercent(asks).reverse(),
    }
  }, [orderbook, orderbookSide])

  // const calculateTotalContractsPrice = (total: number) => {
  //   return NumberUtil.convertWithDenomination(
  //     total,
  //     6
  //   )
  // }

  const spread = useMemo(() => {
    if (!orderBookData) {
      return '0'
    }
    if (!orderBookData.asks.length || !orderBookData.bids.length) {
      return '0'
    }
    return (
      Math.abs(
        new BigNumber(orderBookData.asks.reverse()[0].price)
          .minus(new BigNumber(orderBookData.bids[0].price))
          .toNumber()
      ) * 100
    ).toFixed(0)
  }, [orderBookData])

  const lastPrice = useMemo(() => {
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

  return isMobile ? (
    <OrderBookTableSmall
      setOrderbookSide={setOrderbookSide}
      orderbookSide={orderbookSide}
      orderBookData={orderBookData}
      spread={spread}
      lastPrice={lastPrice}
    />
  ) : (
    <OrderbookTableLarge
      setOrderbookSide={setOrderbookSide}
      orderbookSide={orderbookSide}
      orderBookData={orderBookData}
      spread={spread}
      lastPrice={lastPrice}
    />
  )
}
