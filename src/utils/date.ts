export function timeSinceCreation(timestamp: number): string {
  const now = new Date().getTime()
  const diffInSeconds = Math.floor((now - timestamp * 1000) / 1000)

  if (diffInSeconds <= 60) {
    return `${diffInSeconds}seconds`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes <= 60) {
    return `${diffInMinutes}min`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours <= 24) {
    return `${diffInHours}h`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays <= 7) {
    return `${diffInDays}d`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks <= 4) {
    return `${diffInWeeks}w`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths <= 12) {
    return `${diffInMonths}m`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}y`
}
