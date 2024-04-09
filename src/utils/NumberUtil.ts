export class NumberUtil {
  static formatThousands = (v?: number | string) => {
    return this.toFixed(v, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  static toFixed = (v?: number | string, decimals = 0) => {
    const str = (Number(v ?? 0) ?? 0).toString()
    const [intPart, floatPart] = str.split('.')
    return `${intPart}${
      decimals > 0
        ? `.${Array.from({ length: decimals }, (_, i) => floatPart?.[i] ?? 0).join('')}`
        : ''
    }`
  }
}
