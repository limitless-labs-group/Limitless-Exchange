import BigNumber from 'bignumber.js'
import { ClobPosition } from '@/types/orders'

export const checkPriceIsInRange = (price: number, orderBookPriceRange: number[]) => {
  const priceFormatted = price * 100
  return priceFormatted >= orderBookPriceRange[0] && priceFormatted <= orderBookPriceRange[1]
}

export const getUserOrdersForPrice = (
  orderPrice: number,
  outcome: number,
  orders?: ClobPosition[],
  marketTokens?: {
    yes: string
    no: string
  }
) => {
  return orders?.filter((order) => {
    if (!outcome) {
      if (order.token === marketTokens?.yes) {
        return new BigNumber(order.price).isEqualTo(orderPrice)
      }
      return new BigNumber(1).minus(order.price).isEqualTo(orderPrice)
    }
    if (order.token === marketTokens?.yes) {
      return new BigNumber(1).minus(order.price).isEqualTo(orderPrice)
    }
    return new BigNumber(order.price).isEqualTo(orderPrice)
  })
}

export const hasOrdersForThisOrderBookEntity = (
  orderPrice: number,
  outcome: number,
  orders?: ClobPosition[],
  marketTokens?: {
    yes: string
    no: string
  }
) => {
  const ordersFiltered = getUserOrdersForPrice(orderPrice, outcome, orders, marketTokens)
  return !!ordersFiltered?.length
}

export const checkIfOrderIsRewarded = (
  orderPrice: number,
  userOrders: ClobPosition[] | undefined,
  outcome: number,
  minSize: string,
  marketTokens?: {
    yes: string
    no: string
  }
) => {
  if (!userOrders) {
    return false
  }
  const hasOrders = getUserOrdersForPrice(orderPrice, outcome, userOrders, marketTokens)
  if (hasOrders?.length) {
    return hasOrders.some((order) =>
      new BigNumber(order.originalSize).isGreaterThanOrEqualTo(minSize)
    )
  }
  return false
}
