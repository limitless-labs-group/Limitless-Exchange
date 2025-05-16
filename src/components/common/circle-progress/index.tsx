import { Box, chakra } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeProvider } from '@/providers'

const SIZE = 16
const STROKE_WIDTH = 2
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface CircularProgressProps {
  progress: number
}

export const CircularProgress = ({ progress }: CircularProgressProps) => {
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE
  const { mode } = useThemeProvider()
  const color = useMemo(() => (mode === 'dark' ? '#111827' : '#EDF2F7'), [mode])
  return (
    <Box width={`${SIZE}px`} height={`${SIZE}px`}>
      <chakra.svg width={SIZE} height={SIZE}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill='transparent'
          stroke={color}
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill='transparent'
          stroke='#38B2AC'
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap='round'
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </chakra.svg>
    </Box>
  )
}
