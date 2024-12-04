import BigNumber from 'bignumber.js'

export const defineOpenInterestOverVolume = (
  openInterestFormatted: string,
  targetValue: string
) => {
  const isOpenInterestGreater = new BigNumber(openInterestFormatted).isGreaterThan(
    new BigNumber(targetValue)
  )
  return {
    value: isOpenInterestGreater ? openInterestFormatted : targetValue,
    showOpenInterest: isOpenInterestGreater,
  }
}
