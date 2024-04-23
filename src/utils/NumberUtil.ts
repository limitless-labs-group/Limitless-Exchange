export class NumberUtil {
  static formatThousands = (v?: number | string, decimals = 0): string => {
    return this.toFixed(v, decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  static toFixed = (v?: number | string, decimals = 0, fill = false): string => {
    let numStr = (Number(v ?? 0) ?? 0).toString()
    if (numStr.includes('e')) {
      numStr = '0'
    }
    const [intPart, floatPart] = numStr.split('.')
    return `${intPart}${
      decimals > 0
        ? `.${Array.from(
            { length: decimals },
            (_, i) => floatPart?.[i] ?? (fill || i == 0 ? 0 : '')
          ).join('')}`
        : ''
    }`
  }
}
