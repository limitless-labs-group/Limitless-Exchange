import BigNumber from 'bignumber.js'
import { ClobPosition } from '@/types/orders'

export const checkPriceIsInRange = (price: number, orderBookPriceRange: number[]) => {
  const priceFormatted = price * 100
  return priceFormatted >= orderBookPriceRange[0] && priceFormatted <= orderBookPriceRange[1]
}

export const checkIfUserHasOrdersAtThisPrice = (
  orderPrice: number,
  userOrders: ClobPosition[] | undefined
) => {
  if (!userOrders) {
    return false
  }
  return userOrders.some((order) => new BigNumber(order.price).isEqualTo(new BigNumber(orderPrice)))
}
