export const checkPriceIsInRange = (price: number, orderBookPriceRange: number[]) => {
  const priceFormatted = price * 100
  return priceFormatted >= orderBookPriceRange[0] && priceFormatted <= orderBookPriceRange[1]
}
