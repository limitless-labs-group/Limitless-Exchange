export class NumberUtil {
  static formatThousands = (v?: number | string) =>
    NumberUtil.toIntString(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  static toFixed = (v?: number | string, decimals?: number) =>
    (Number(v ?? 0) ?? 0).toFixed(decimals)

  static toIntString = (v?: number | string) => (Number(v ?? 0) ?? 0).toString().split('.')[0]
}
