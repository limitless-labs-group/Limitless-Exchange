import BigNumber from 'bignumber.js'
import { formatUnits } from 'viem'
import { Order, OrderBook } from '@/hooks/use-order-book'

const calculatePercent = (array: Order[], decimals?: number) => {
  const totalSize = array.reduce((sum, item) => sum + item.size, 0)
  let cumulativePrice = 0

  let cumulativePercent = 0
  return array.map((item) => {
    const percent = (item.size / totalSize) * 100
    cumulativePercent += percent
    cumulativePrice += new BigNumber(formatUnits(BigInt(item.size), decimals || 6))
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

const calculatePercentReverse = (array: Order[], decimals?: number) => {
  const totalSum = array.reduce(
    (sum, bid) =>
      sum +
      new BigNumber(formatUnits(BigInt(bid.size), decimals || 6))
        .multipliedBy(bid.price)
        .toNumber(),
    0
  )

  let cumulativeSum = 0
  const processedBids = array
    .slice()
    .map((order) => {
      const bidSum = new BigNumber(formatUnits(BigInt(order.size), decimals || 6))
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

export const getOrderBookData = (outcome: number, orderbook?: OrderBook, decimals?: number) => {
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
    bids: calculatePercent(bids, decimals),
    asks: calculatePercentReverse(asks, decimals),
  }
}
