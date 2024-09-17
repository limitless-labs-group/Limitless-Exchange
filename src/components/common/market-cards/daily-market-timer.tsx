import { useEffect, useState } from 'react'

interface DailyMarketTimerProps {
  deadline: string
}

const calculateTimeRemaining = (deadline: string) => {
  const now = new Date().getTime()
  const timeLeft = new Date(deadline).getTime() - now

  return {
    hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
  }
}

const formatTime = ({
  hours,
  minutes,
  seconds,
}: {
  hours: number
  minutes: number
  seconds: number
}) => {
  return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m:${String(
    seconds
  ).padStart(2, '0')}s`
}

export default function DailyMarketTimer({ deadline }: DailyMarketTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(deadline))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline))
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  return <div>{formatTime(timeRemaining)}</div>
}
