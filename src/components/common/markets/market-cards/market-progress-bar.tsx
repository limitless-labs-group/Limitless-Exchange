import { Box, HStack, Text } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import ProgressBar from '@/components/common/progress-bar'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

const PROGRESS_THRESHOLDS = [
  { max: 15, variant: 'red', color: 'var(--chakra-colors-red-500)' },
  { max: 35, variant: 'yellow', color: 'var(--chakra-colors-orange-500)' },
  { max: 100, variant: 'green', color: 'var(--chakra-colors-green-500)' },
] as const

interface MarketProgressBarProps {
  value: number
}

export const MarketProgressBar = ({ value }: MarketProgressBarProps) => {
  const getProgressData = useMemo(
    () => (value: number) => {
      return (
        PROGRESS_THRESHOLDS.find((threshold) => value <= threshold.max) ??
        PROGRESS_THRESHOLDS[PROGRESS_THRESHOLDS.length - 1]
      )
    },
    []
  )

  const getVariant = useMemo(
    () => (value: number) => getProgressData(value).variant,
    [getProgressData]
  )

  const getProgressColor = useMemo(
    () => (value: number) => getProgressData(value).color,
    [getProgressData]
  )

  return (
    <Box>
      <HStack w='full' justifyContent='space-between' mb='4px'>
        <Text {...paragraphMedium} color={getProgressColor(value)}>
          Yes {Number(value.toFixed(2)).toString()}%
        </Text>
        <Text {...paragraphMedium} color='grey.500'>
          No {Number((100 - value).toFixed(2)).toString()}%
        </Text>
      </HStack>

      <ProgressBar variant={getVariant(value)} size='xs' value={value} />
    </Box>
  )
}
