import { useEffect, useState } from 'react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Text } from '@chakra-ui/react'

interface DailyMarketTimerProps {
  deadline: string
  color: string
  showDays?: boolean
}

const calculateTimeRemaining = (deadline: string) => {
  const now = new Date().getTime()
  const timeLeft = new Date(deadline).getTime() - now

  if (timeLeft < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  return {
    days: Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
  }
}

const formatTime = ({
  days,
  hours,
  minutes,
  seconds,
  showDays,
}: {
  days: number
  hours: number
  minutes: number
  seconds: number
  showDays: boolean
}) => {
  return `${showDays ? `${String(days).padStart(2, '0')}d:` : ''}${String(hours).padStart(
    2,
    '0'
  )}h:${String(minutes).padStart(2, '0')}m:${String(seconds).padStart(2, '0')}s`
}

export default function DailyMarketTimer({
  deadline,
  color,
  showDays = true,
}: DailyMarketTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(new Date(deadline).getTime() > new Date().getTime() ? deadline : '0')
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline))
    }, 1000)

    if (new Date(deadline).getTime() < new Date().getTime()) {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [deadline])

  return (
    <Text {...paragraphMedium} color={color}>
      {formatTime({ ...timeRemaining, showDays })}
    </Text>
  )
}
