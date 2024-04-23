export class NumberUtil {
  static formatThousands = (v?: number | string, decimals = 0) => {
    return this.toFixed(v, decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  static toFixed = (v?: number | string, decimals = 0, fill = false) => {
    const str = (Number(v ?? 0) ?? 0).toString()
    const [intPart, floatPart] = str.split('.')
    return `${intPart}${
      decimals > 0
        ? `.${Array.from(
            { length: decimals },
            (_, i) => floatPart?.[i] ?? (fill || i == 0 ? 0 : '')
          ).join('')}`
        : ''
    }`
  }

  // toFixed without scientific notation
  static toFixedWSN = (input?: string | number, decimals?: number) => {
    const numberValue = Number(input ?? 0)

    // Check if the number is in scientific notation
    if (numberValue.toString().includes('e') || numberValue.toString().includes('E')) {
      // If in scientific notation, convert to string preserving decimal places
      return numberValue.toFixed(18).replace(/\.?0+$/, '')
    }

    return numberValue.toFixed(decimals ?? 6).replace(/\.?0+$/, '')
  }
}
