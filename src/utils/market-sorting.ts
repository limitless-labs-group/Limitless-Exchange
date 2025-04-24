import { Market, MarketSortOption, Sort } from '@/types'

type MarketOrGroup = Market

export const getSortValue = (sortName: Sort): MarketSortOption => {
  switch (sortName) {
    case Sort.DEFAULT:
    case Sort.TRENDING:
      return MarketSortOption.TRENDING
    case Sort.NEWEST:
      return MarketSortOption.NEWEST
    case Sort.ENDING_SOON:
      return MarketSortOption.ENDING_SOON
    case Sort.HIGHEST_VALUE:
      return MarketSortOption.HIGH_VALUE
    case Sort.LP_REWARDS:
      return MarketSortOption.LP_REWARDS
    default:
      return MarketSortOption.DEFAULT
  }
}

const getVolumeForMarket = (market: MarketOrGroup): number => {
  return Number(market.volumeFormatted)
}

const getLiquidityForMarket = (market: MarketOrGroup): number => {
  return Number(market.liquidityFormatted)
}

const getValueForMarket = (market: Market): number => {
  return Number(market.liquidityFormatted) + Number(market.openInterestFormatted) || 0
}

const getAggregatedMarketValue = (market: MarketOrGroup): number => {
  const volume = getVolumeForMarket(market)
  const value = getValueForMarket(market)
  if (value > volume) {
    return value
  }
  return volume
}

const getMarketTradeType = (market: MarketOrGroup): string => {
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

    case Sort.ENDING_SOON:
      return marketsCopy.sort(
        (a, b) =>
          new Date(a.expirationTimestamp).getTime() - new Date(b.expirationTimestamp).getTime()
      ) as T

    case Sort.HIGHEST_VALUE:
      return marketsCopy.sort((a, b) => {
        const aggregatedValueA = getAggregatedMarketValue(a)
        const aggregatedValueB = getAggregatedMarketValue(b)

        return (
          convertTokenAmountToUsd(b.collateralToken.symbol, aggregatedValueB) -
          convertTokenAmountToUsd(a.collateralToken.symbol, aggregatedValueA)
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
