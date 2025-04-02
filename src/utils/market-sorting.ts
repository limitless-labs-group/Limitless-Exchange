import { Market, Sort } from '@/types'

const getVolumeForMarket = (market: Market): number => {
  return Number((market as Market).volumeFormatted)
}

const getLiquidityForMarket = (market: Market): number => {
  return Number((market as Market).liquidityFormatted)
}

const getValueForMarket = (market: Market): number => {
  return (
    Number((market as Market).liquidityFormatted) + Number((market as Market).openInterestFormatted)
  )
}

const getMarketTradeType = (market: Market): string => {
  return (market as Market).tradeType
}

const getTrendingRank = (market: Market, category: 'hourly' | 'last30days' = 'hourly'): number => {
  if ((market as Market).trends) {
    if ((market as Market)?.trends?.[category]?.rank !== undefined) {
      return (market as Market)?.trends?.[category]?.rank ?? 0
    }

    const fallbackCategory = category === 'hourly' ? 'last30days' : 'hourly'
    if ((market as Market).trends?.[fallbackCategory]?.rank !== undefined) {
      return (market as Market).trends?.[fallbackCategory]?.rank ?? 0
    }
  }

  return Number.MAX_SAFE_INTEGER / 2
}

export function sortMarkets<T extends Market[]>(
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

    case Sort.TRENDING:
      return marketsCopy.sort((a, b) => {
        const trendingRankA = getTrendingRank(a, 'hourly')
        const trendingRankB = getTrendingRank(b, 'hourly')
        return trendingRankA - trendingRankB
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

    case Sort.HIGHEST_VALUE:
      return marketsCopy.sort((a, b) => {
        const valueA = getValueForMarket(a)
        const valueB = getValueForMarket(b)

        return (
          convertTokenAmountToUsd(b.collateralToken.symbol, valueB) -
          convertTokenAmountToUsd(a.collateralToken.symbol, valueA)
        )
      }) as T

    case Sort.LP_REWARDS:
      return marketsCopy.filter((a) => {
        const type = getMarketTradeType(a)
        return type === 'clob'
      }) as T

    default:
      return marketsCopy as T
  }
}
