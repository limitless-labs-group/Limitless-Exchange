import BigNumber from 'bignumber.js'
import React, { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import OrderbookTableLarge from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-large'
import OrderBookTableSmall from '@/app/(markets)/markets/[address]/components/clob/orderbook-table-small'
import { Order, useOrderBook } from '@/hooks/use-order-book'
import { useTradingService } from '@/services'
import { NumberUtil } from '@/utils'

export default function Orderbook() {
  const [orderbookSide, setOrderbookSide] = useState(0)
  const { market } = useTradingService()
  const { data: orderbook } = useOrderBook(market?.slug)

  function calculatePercent(array: Order[]) {
    const totalSize = array.reduce((sum, item) => sum + item.size, 0) // Total size of the array

    let cumulativePercent = 0 // Track cumulative percentage
    return array.map((item) => {
      const percent = (item.size / totalSize) * 100 // Percent value
      cumulativePercent += percent // Update cumulative percentage
      return {
        ...item,
        percent: percent.toFixed(2), // Percent relative to total
        cumulativePercent: cumulativePercent.toFixed(2), // Cumulative percent
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
      : orderbook.asks.reverse()
    return {
      bids: calculatePercent(bids),
      asks: calculatePercent(asks.reverse()),
    }
  }, [orderbook, orderbookSide])

  const calculateTotalContractsPrice = (size: number, price: number) => {
    const contractsFormatted = formatUnits(BigInt(size), market?.collateralToken.decimals || 6)
    return NumberUtil.convertWithDenomination(
      new BigNumber(contractsFormatted).multipliedBy(new BigNumber(price)).toString(),
      6
    )
  }

  const spread = useMemo(() => {
    if (!orderBookData) {
      return '0'
    }
    if (!orderBookData.asks.length || !orderBookData.bids.length) {
      return '0'
    }
    return (
      Math.abs(
        new BigNumber(orderBookData.asks[0].price)
          .minus(new BigNumber(orderBookData.bids[0].price))
          .toNumber()
      ) * 100
    ).toFixed(0)
  }, [orderBookData])

  return isMobile ? (
    <OrderBookTableSmall
      setOrderbookSide={setOrderbookSide}
      orderbookSide={orderbookSide}
      calculateTotalContractsPrice={calculateTotalContractsPrice}
      orderBookData={orderBookData}
      spread={spread}
    />
  ) : (
    <OrderbookTableLarge
      setOrderbookSide={setOrderbookSide}
      orderbookSide={orderbookSide}
      calculateTotalContractsPrice={calculateTotalContractsPrice}
      orderBookData={orderBookData}
      spread={spread}
    />
  )
}
