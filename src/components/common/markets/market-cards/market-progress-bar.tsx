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
  const progressData = useMemo(() => {
    const threshold =
      PROGRESS_THRESHOLDS.find((t) => value <= t.max) ??
      PROGRESS_THRESHOLDS[PROGRESS_THRESHOLDS.length - 1]
    return {
      variant: threshold.variant,
      color: threshold.color,
    }
  }, [value])

  return (
    <Box>
      <HStack w='full' justifyContent='space-between' mb='4px'>
        <Text {...paragraphMedium} color={progressData.color}>
          Yes {Number(value.toFixed(2)).toString()}%
        </Text>
        <Text {...paragraphMedium} color='grey.500'>
          No {Number((100 - value).toFixed(2)).toString()}%
        </Text>
      </HStack>

      <ProgressBar variant={progressData.variant} size='xs' value={value} />
    </Box>
  )
}
