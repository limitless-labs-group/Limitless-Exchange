import { Box, Flex, HStack, Text } from '@chakra-ui/react'
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
  isClosed?: boolean
}

export const MarketProgressBar = ({ isClosed = false, value }: MarketProgressBarProps) => {
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
        {yes > 0 && isClosed ? (
          <Flex w='full' justifyContent='start'>
            <Text {...paragraphMedium} color={progressData.color}>
              Yes {yes}%
            </Text>
          </Flex>
        ) : null}
        {no > 0 && isClosed ? (
          <Flex textAlign='left' w='full' justifyContent='end'>
            <Text {...paragraphMedium} color='grey.500'>
              No {no}%
            </Text>
          </Flex>
        ) : null}
      </HStack>

      <ProgressBar variant={progressData.variant} size='xs' value={value} />
    </Box>
  )
}
