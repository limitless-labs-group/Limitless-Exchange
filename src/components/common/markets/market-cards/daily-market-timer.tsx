import { Text, TextProps } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

type DailyMarketTimerProps = TextProps & {
  deadline: number
  color: string
  showDays?: boolean
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
  ...props
}: DailyMarketTimerProps) {
  const calculateTimeRemaining = useCallback(() => {
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
  }, [deadline])

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [calculateTimeRemaining])

  return (
    <Text {...paragraphMedium} color={color} {...props}>
      {formatTime({ ...timeRemaining, showDays })}
    </Text>
  )
}
