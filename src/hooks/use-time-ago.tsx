import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect } from 'react'

export const useTimeAgo = (createdAt: string) => {
  if (isNaN(new Date(createdAt).getTime())) {
    throw new Error('Invalid date string provided')
  }
  const getTimeAgo = () => formatDistanceToNow(new Date(createdAt), { addSuffix: true })
  const [timeAgo, setTimeAgo] = useState(() => getTimeAgo())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeAgo(getTimeAgo())
    }, 60000) // Update every minute

    return () => clearInterval(intervalId)
  }, [createdAt])

  return timeAgo
}
