import BigNumber from 'bignumber.js'
import { ClobPosition } from '@/types/orders'
import { calculateDisplayRange } from '@/utils/market'

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

export const isOpenOrderRewarded = (
  order: ClobPosition,
  midpoint?: number,
  spread?: string,
  minSize?: string,
  marketTokens?: {
    yes: string
    no: string
  }
) => {
  if (!marketTokens || !midpoint || !minSize || !spread) {
    return false
  }
  if (new BigNumber(minSize).isGreaterThan(order.originalSize)) {
    return false
  }
  const token = order.token === marketTokens.yes ? 0 : 1
  const range = calculateDisplayRange(token, midpoint, spread)
  const price = new BigNumber(order.price).multipliedBy(100)
  return price.isGreaterThanOrEqualTo(range.lower) && price.isLessThanOrEqualTo(range.upper)
}
