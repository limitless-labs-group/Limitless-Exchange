import { Progress, ProgressProps } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'

export default function ProgressBar({ size, ...props }: ProgressProps) {
  return (
    <Progress
      size={size}
      {...props}
      sx={{
        '& > div:first-of-type': {
          borderRadius: 0,
        },
        position: isMobile ? 'unset' : 'relative',
      }}
    />
  )
}
