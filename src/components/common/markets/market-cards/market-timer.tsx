import { Box, HStack, Text, TextProps } from '@chakra-ui/react'
import React, { useEffect, useState, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

export type MarketTimerProps = TextProps & {
  deadline: number
  color: string
  showDays?: boolean
  topMarket?: boolean
  deadlineText: string
  hideText?: boolean
  ended: boolean
}

const formatTime = ({
  hours,
  minutes,
  seconds,
  showDays,
}: {
  hours: number
  minutes: number
  seconds: number
  showDays: boolean
}) => {
  return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m:${String(
    seconds
  ).padStart(2, '0')}s`
}

export default function MarketTimer({
  deadline,
  color,
  deadlineText,
  showDays = true,
  topMarket = false,
  hideText = false,
  ...props
}: MarketTimerProps) {
  const calculateTimeRemaining = useCallback(() => {
    const now = new Date().getTime()
    const timeLeft = new Date(deadline).getTime() - now

    if (timeLeft < 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    }

    return {
      hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
    }
  }, [deadline])

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining())

  useEffect(() => {
    const now = new Date().getTime()
    const timeLeft = new Date(deadline).getTime() - now
    if (timeLeft > 86400000) {
      return
    }
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [calculateTimeRemaining, deadline])

  const deadlineLeftInPercent = 100 - ((deadline - new Date().getTime()) / 86400000) * 100

  return (
    <HStack gap={!hideText ? '8px' : 'unset'}>
      <Text {...paragraphRegular} color={color || 'grey.500'}>
        {!hideText
          ? `Ends ${new Date(deadline).getTime() - new Date().getTime() > 86400000 ? 'on' : 'in'}`
          : null}
      </Text>
      {new Date(deadline).getTime() - new Date().getTime() > 86400000 ? (
        <HStack gap={isMobile ? '8px' : '4px'} color={color} {...props}>
          <CalendarIcon width={16} height={16} />
          <Text {...paragraphRegular} color={color} {...props}>
            {deadlineText}
          </Text>
        </HStack>
      ) : (
        <HStack gap='4px'>
          <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
            <Box
              h='100%'
              w='100%'
              borderRadius='100%'
              bg={`conic-gradient(var(--chakra-colors-${
                topMarket ? 'transparent-700' : 'grey-500'
              }) ${deadlineLeftInPercent.toFixed(0)}% 0%, var(--chakra-colors-${
                topMarket ? 'transparent-200' : 'grey-200'
              }) ${deadlineLeftInPercent.toFixed(0)}% 100%)`}
            />
          </Box>
          <Text {...paragraphRegular} color={color} {...props} minW={isMobile ? '102px' : '90px'}>
            {formatTime({ ...timeRemaining, showDays })}
          </Text>
        </HStack>
      )}
    </HStack>
  )
}
