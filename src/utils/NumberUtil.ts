import BigNumber from 'bignumber.js'

export class NumberUtil {
  static formatThousands = (v?: number | string, decimals = 0): string => {
    const parts = `${this.toFixed(v, decimals)}`.split('.')
    return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
      parts[1]?.length ? `.${parts[1]}` : ''
    }`
  }

  static convertWithDenomination = (v?: number | string, decimals = 0, symbol?: string): string => {
    const denominationDigits = symbol === 'USDC' ? 2 : decimals
    const parts = `${this.toFixed(v, denominationDigits)}`.split('.')
    return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
      parts[1]?.length ? `.${parts[1]}` : ''
    }`
  }

  static multiply = (v: number | string, mul: string | number) => {
    return new BigNumber(v).multipliedBy(mul).decimalPlaces(1).toString()
  }

  static convertToSymbols = (v: number | string) => {
    if (+v < 100000) {
      return this.convertWithDenomination(v)
    }
    if (+v < 1000000) {
      return `${new BigNumber(v).dividedBy(1000).decimalPlaces(2).toString()}k`
    }
    if (+v < 100000000) {
      return `${new BigNumber(v).dividedBy(1000000).decimalPlaces(2).toString()}m`
    }
    if (+v < 1000000000) {
      return `${new BigNumber(v).dividedBy(1000000).decimalPlaces(1).toString()}m`
    }
    return `${new BigNumber(v).dividedBy(1000000000).decimalPlaces(2).toString()}b`
  }

  static toFixed = (v?: number | string, decimals = 0, fill = false, truncate = true): string => {
    const numberValue = Number(v ?? 0)
    let numberStr = numberValue.toString()

    // Check if the number is in scientific notation
    let isSciNot = false
    if (numberValue.toString().toLowerCase().includes('e')) {
      // If in scientific notation, convert to string preserving decimal places
      numberStr = numberValue.toFixed(18).replace(/\.?0+$/, '')
      decimals = 18
      isSciNot = true
    }

    // trim decimals as string to prevent rounding
    const [intPart, floatPart] = numberStr.split('.')
    const formattedNumberStr = `${intPart}${
      decimals > 0
        ? `.${Array.from(
            { length: decimals },
            (_, i) => floatPart?.[i] ?? (fill || i == 0 ? 0 : '')
          ).join('')}`
        : ''
    }`

    if (!isSciNot && truncate) {
      // trunc trailing zeros
      const truncatedNumberStr = parseFloat(formattedNumberStr).toString()
      return truncatedNumberStr
    }

    return formattedNumberStr
  }
}
