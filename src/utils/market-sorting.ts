import { Market, MarketGroup, Sort } from '../types'

type MarketOrGroup = Market | MarketGroup

const getVolumeForMarket = (market: MarketOrGroup): number => {
  if ('slug' in market && market.slug) {
    return (market as MarketGroup).markets.reduce((acc, m) => acc + Number(m.volumeFormatted), 0)
  }
  return Number((market as Market).volumeFormatted)
}

const getLiquidityForMarket = (market: MarketOrGroup): number => {
  if ('slug' in market && market.slug) {
    return (market as MarketGroup).markets.reduce((acc, m) => acc + Number(m.liquidityFormatted), 0)
  }
  return Number((market as Market).liquidityFormatted)
}

export function sortMarkets<T extends Market[] | MarketGroup[] | (Market | MarketGroup)[]>(
  markets: T,
  sortType: Sort,
  convertTokenAmountToUsd: (symbol: string, amount: number) => number
): T {
  if (!markets?.length) return markets

  const marketsCopy = [...markets] as T

  switch (sortType) {
    case Sort.NEWEST:
      return marketsCopy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) as T

    case Sort.HIGHEST_VOLUME:
      return marketsCopy.sort((a, b) => {
        const volumeA = getVolumeForMarket(a)
        const volumeB = getVolumeForMarket(b)

        return (
          convertTokenAmountToUsd(b.collateralToken.symbol, volumeB) -
          convertTokenAmountToUsd(a.collateralToken.symbol, volumeA)
        )
      }) as T

    case Sort.HIGHEST_LIQUIDITY:
      return marketsCopy.sort((a, b) => {
        const liquidityA = getLiquidityForMarket(a)
        const liquidityB = getLiquidityForMarket(b)

        return (
          convertTokenAmountToUsd(b.collateralToken.symbol, liquidityB) -
          convertTokenAmountToUsd(a.collateralToken.symbol, liquidityA)
        )
      }) as T

    case Sort.ENDING_SOON:
      return marketsCopy.sort(
        (a, b) =>
          new Date(a.expirationTimestamp).getTime() - new Date(b.expirationTimestamp).getTime()
      ) as T

    default:
      return marketsCopy as T
  }
}