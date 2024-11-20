import { Progress, ProgressProps } from '@chakra-ui/react'

export default function ProgressBar({ ...props }: ProgressProps) {
  return (
    <Progress
      {...props}
      sx={{
        height: '16px',
        '& > div:first-of-type': {
          borderRadius: 0,
        },
      }}
    />
  )
}
