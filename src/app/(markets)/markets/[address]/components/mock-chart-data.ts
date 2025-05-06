import { addHours, subHours } from 'date-fns'

export interface PriceHistory {
  name: string
  data: Array<{
    timestamp: number
    value: number
  }>
}

const generateVolatileData = (
  startDate: Date,
  points: number,
  baseValue: number,
  volatility: number
): Array<{ timestamp: number; value: number }> => {
  const data = []
  let currentValue = baseValue

  for (let i = 0; i < points; i++) {
    // Generate more dramatic price movements
    const change = (Math.random() - 0.5) * volatility
    currentValue = Math.max(0, Math.min(100, currentValue + change))

    const timestamp = addHours(startDate, i).getTime()
    data.push({
      timestamp,
      value: Number(currentValue.toFixed(2)),
    })
  }

  return data
}

// Create base timestamp for the last 24 hours
const now = new Date()
const baseTimestamp = subHours(now, 24)

// Generate more volatile mock data for each market
export const mockPriceHistories: PriceHistory[] = [
  {
    name: 'Group 1',
    data: generateVolatileData(baseTimestamp, 500, 95, 8),
  },
  {
    name: 'Group 2',
    data: generateVolatileData(baseTimestamp, 500, 5, 4), // Low base value, low volatility
  },
  {
    name: 'Group 3',
    data: generateVolatileData(baseTimestamp, 500, 75, 12), // Medium-high base value, high volatility
  },
  {
    name: 'Group 4',
    data: generateVolatileData(baseTimestamp, 500, 2, 3), // Very low base value, low volatility
  },
  {
    name: 'Group 5',
    data: generateVolatileData(baseTimestamp, 500, 98, 6), // Very high base value, moderate volatility
  },
]

// Helper function to get data for different time periods
export const getHistoricalData = (period: '1H' | '6H' | '1D' | '1W' | '1M' | 'ALL') => {
  const now = new Date()
  let startDate: Date
  let points: number

  switch (period) {
    case '1H':
      startDate = subHours(now, 1)
      points = 60 // One point per minute
      break
    case '6H':
      startDate = subHours(now, 6)
      points = 72 // One point per 5 minutes
      break
    case '1D':
      startDate = subHours(now, 24)
      points = 96 // One point per 15 minutes
      break
    case '1W':
      startDate = subHours(now, 24 * 7)
      points = 168 // One point per hour
      break
    case '1M':
      startDate = subHours(now, 24 * 30)
      points = 180 // One point per 4 hours
      break
    case 'ALL':
      startDate = subHours(now, 24 * 90)
      points = 180 // One point per 12 hours
      break
    default:
      startDate = subHours(now, 24)
      points = 96
  }

  return [
    {
      name: 'Group 1',
      data: generateVolatileData(startDate, points, 95, 8),
    },
    {
      name: 'Group 2',
      data: generateVolatileData(startDate, points, 5, 4),
    },
    {
      name: 'Group 3',
      data: generateVolatileData(startDate, points, 75, 12),
    },
    {
      name: 'Group 4',
      data: generateVolatileData(startDate, points, 2, 3),
    },
    {
      name: 'Group 5',
      data: generateVolatileData(startDate, points, 98, 6),
    },
  ]
}
