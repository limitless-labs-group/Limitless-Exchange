import BigNumber from 'bignumber.js'
import { ClobPosition } from '@/types/orders'

export const checkPriceIsInRange = (price: number, orderBookPriceRange: number[]) => {
  const priceFormatted = price * 100
  return priceFormatted >= orderBookPriceRange[0] && priceFormatted <= orderBookPriceRange[1]
}

const getOrderPrice = (price: string, side: 'BUY' | 'SELL', outcome: number) => {
  if (side === 'BUY') {
    return outcome ? new BigNumber(1).minus(price).toString() : price
  }
  return outcome ? price : new BigNumber(1).minus(price).toString()
}

export const checkIfUserHasOrdersAtThisPrice = (
  orderPrice: number,
  userOrders: ClobPosition[] | undefined,
  outcome: number
) => {
  if (!userOrders) {
    return false
  }
  const orderPriceFormatted = orderPrice
  const userOrdersFormatted = outcome
    ? userOrders.map((order) => ({
        ...order,
        price: getOrderPrice(order.price, order.side, outcome),
      }))
    : userOrders
  return userOrdersFormatted.some((order) =>
    new BigNumber(order.price).isEqualTo(new BigNumber(orderPriceFormatted))
  )
}
