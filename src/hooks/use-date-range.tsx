import { startOfMonth, endOfDay, startOfDay, subDays, addDays, format } from 'date-fns'

export const useDateRanges = (date = new Date()) => {
  const getMonthlyDateRange = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfDay(date)
    return { start, end }
  }

  const getWeeklyDateRange = (date: Date) => {
    const dayOfWeek = date.getDay()
    const daysToLastFriday = (dayOfWeek + 2) % 7
    const lastFriday = startOfDay(subDays(date, daysToLastFriday))
    const nextThursday = endOfDay(addDays(lastFriday, 6))
    return { start: lastFriday, end: nextThursday }
  }

  const formatDateRange = (range: { start: Date; end: Date }) => {
    return `${format(range.start, 'MMM d')} - ${format(range.end, 'MMM d')}`
  }

  const monthlyDateRange = getMonthlyDateRange(date)
  const weeklyDateRange = getWeeklyDateRange(date)

  const MONTHLY_LEADERBOARD_PERIOD = formatDateRange(monthlyDateRange)
  const WEEKLY_LEADERBOARD_PERIOD = formatDateRange(weeklyDateRange)

  return {
    monthlyDateRange,
    weeklyDateRange,
    MONTHLY_LEADERBOARD_PERIOD,
    WEEKLY_LEADERBOARD_PERIOD,
  }
}
