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
}
