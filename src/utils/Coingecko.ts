import axios from 'axios'

export class Coingecko {
  static async ethPriceUsd() {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    return data?.ethereum?.usd as number
  }

  static async usdToEth(usd: number) {
    const ethPriceUsd = await this.ethPriceUsd()
    return usd / ethPriceUsd
  }
}
