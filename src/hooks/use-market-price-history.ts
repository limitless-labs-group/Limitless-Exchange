import { useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { defaultChain, newSubgraphURI } from '@/constants'
import { limitlessApi } from '@/services'
import { Market } from '@/types'

// Define the interface for the chart data
interface YesBuyChartData {
  yesBuyChartData: [number, number]
}

const ONE_HOUR = 3_600_000 // milliseconds in an hour

/**
 * Flattens and interpolates price data for a chart.
 *
 * This function takes an array of YesBuyChartData objects, interpolates missing
 * hourly data points, and converts prices to percentages. The function appends
 * the current timestamp with the last price in the data array to ensure the
 * latest data point is included.
 *
 * @param {YesBuyChartData[]} data - The array of YesBuyChartData objects.
 * @returns {number[][]} - A 2D array of flattened and interpolated price data,
 *                         where each sub-array contains a timestamp and a price percentage.
 */
const flattenPriceData = (data: YesBuyChartData[]): number[][] => {
  if (!data || data.length === 0) {
    return []
  }

  const flattenData: number[][] = []

  // Append current timestamp with the last price
  const lastTrade = [...data[data.length - 1].yesBuyChartData]
  lastTrade[0] = Math.floor(Date.now())
  data.push({ yesBuyChartData: lastTrade as [number, number] })
  //TODO: hotfix of envio duplication
  const deduplicator = new Set<number>()

  for (let i = 0; i < data.length - 1; i++) {
    const currentTrade = data[i].yesBuyChartData

    if (isNaN(currentTrade[1])) {
      continue
    }

    const nextTrade = data[i + 1].yesBuyChartData

    if (deduplicator.has(currentTrade[1])) {
      continue
    }

    flattenData.push(currentTrade)
    deduplicator.add(currentTrade[1])

    let currentTime = currentTrade[0]
    while (currentTime + ONE_HOUR < nextTrade[0]) {
      currentTime += ONE_HOUR
      flattenData.push([currentTime, currentTrade[1]])
    }
  }

  return flattenData
}

export function useMarketPriceHistory(market: Market | null) {
  return useQuery({
    queryKey: ['prices', market?.slug],
    queryFn: async () => {
      if (market?.tradeType === 'clob') {
        const response: AxiosResponse<{ price: number; timestamp: number }[]> =
          await limitlessApi.get(`/markets/${market.slug}/historical-price`)
        return response.data.map((item) => {
          return [item.timestamp, item.price * 100]
        })
      }
      const marketId = market?.address
      const query = `query prices {
          AutomatedMarketMakerPricing(where: { market_id: { _ilike: "${marketId}" } }) {
            yesBuyChartData
          }
      }`

      const response = await axios.post(newSubgraphURI[defaultChain.id], { query })
      const pricingData = response.data.data?.AutomatedMarketMakerPricing as YesBuyChartData[]

      return flattenPriceData(
        pricingData.sort((a, b) => {
          return a.yesBuyChartData[0] - b.yesBuyChartData[0]
        })
      )
    },
    staleTime: Infinity,
    enabled: !!market,
  })
}
