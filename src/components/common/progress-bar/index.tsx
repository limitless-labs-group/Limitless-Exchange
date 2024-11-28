import { Progress, ProgressProps } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'

export default function ProgressBar({ ...props }: ProgressProps) {
  return (
    <Progress
      {...props}
      sx={{
        height: '16px',
        '& > div:first-of-type': {
          borderRadius: 0,
        },
        position: isMobile ? 'unset' : 'relative',
      }}
    />
  )
}
