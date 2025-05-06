import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import ProgressBar from '@/components/common/progress-bar'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

interface MarketProgressBarProps {
  value: number
  isClosed?: boolean
  noColor?: string
  variant?: string
}

export const MarketProgressBar = ({
  isClosed,
  value,
  noColor = 'grey.500',
  variant = 'default',
}: MarketProgressBarProps) => {
  const PROGRESS_THRESHOLDS = [
    {
      max: 25,
      variant: variant === 'default' ? 'red' : 'redAndWhiteTrack',
      color: 'var(--chakra-colors-red-500)',
    },
    {
      max: 50,
      variant: variant === 'default' ? 'yellow' : 'yellowAndWhiteTrack',
      color: 'var(--chakra-colors-orange-500)',
    },
    {
      max: 100,
      variant: variant === 'default' ? 'green' : 'greenAndWhiteTrack',
      color: 'var(--chakra-colors-green-500)',
    },
  ] as const

  const progressData = useMemo(() => {
    const threshold =
      PROGRESS_THRESHOLDS.find((t) => value <= t.max) ??
      PROGRESS_THRESHOLDS[PROGRESS_THRESHOLDS.length - 1]
    return {
      variant: threshold.variant,
      color: threshold.color,
    }
  }, [value])

  const yes = useMemo(() => Number(value.toFixed(2)), [value])
  const no = useMemo(() => Number((100 - value).toFixed(2)), [value])

  return (
    <Box>
      <HStack w='full' mb='4px' justifyContent='space-between'>
        {!isClosed || (yes > 0 && isClosed) ? (
          <Flex w='full' justifyContent='start'>
            <Text {...paragraphMedium} color={progressData.color}>
              Yes {yes}%
            </Text>
          </Flex>
        ) : null}
        {!isClosed || (no > 0 && isClosed) ? (
          <Flex textAlign='left' w='full' justifyContent='end'>
            <Text {...paragraphMedium} color={noColor}>
              No {no}%
            </Text>
          </Flex>
        ) : null}
      </HStack>

      <ProgressBar variant={progressData.variant} size='xs' value={value} />
    </Box>
  )
}
