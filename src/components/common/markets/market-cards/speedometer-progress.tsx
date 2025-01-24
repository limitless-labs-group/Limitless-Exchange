import { Box, Text, useTheme } from '@chakra-ui/react'

interface SpeedometerProps {
  value: number
  size?: 'small' | 'medium' | 'large'
}

const SIZE_MAP = {
  small: { diameter: 40, strokeWidth: 2, fontSize: 10 },
  medium: { diameter: 60, strokeWidth: 3, fontSize: 12 },
  large: { diameter: 100, strokeWidth: 5, fontSize: 18 },
}

export const SpeedometerProgress: React.FC<SpeedometerProps> = ({ value, size = 'medium' }) => {
  const { diameter, strokeWidth, fontSize } = SIZE_MAP[size]
  const radius = diameter / 2 - strokeWidth
  const circumference = Math.PI * radius
  const progress = (value / 100) * circumference

  const theme = useTheme()

  const getColor = () => {
    if (value < 15) return theme.colors.red[500]
    if (value < 50) return theme.colors.orange[500]
    return theme.colors.green[500]
  }

  return (
    <Box
      position='relative'
      display='flex'
      alignItems='center'
      justifyContent='center'
      width={`${diameter}px`}
      height={`${diameter / 2}px`}
    >
      <svg
        width='100%'
        height='100%'
        viewBox={`0 ${-strokeWidth} ${diameter} ${diameter / 2 + strokeWidth}`}
      >
        <path
          d={`M${strokeWidth},${diameter / 2} A${radius},${radius} 0 0,1 ${
            diameter - strokeWidth
          },${diameter / 2}`}
          fill='none'
          stroke={theme.colors.grey[300]}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
        />
        <path
          d={`M${strokeWidth},${diameter / 2} A${radius},${radius} 0 0,1 ${
            diameter - strokeWidth
          },${diameter / 2}`}
          fill='none'
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap='round'
        />
      </svg>
      <Text
        position='absolute'
        top='64%'
        fontSize={`${fontSize}px`}
        lineHeight={`${fontSize}px`}
        fontWeight='bold'
        color={getColor()}
      >
        {value}%
      </Text>
    </Box>
  )
}
