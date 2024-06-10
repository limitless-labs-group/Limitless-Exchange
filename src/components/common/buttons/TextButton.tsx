import type { ButtonProps } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'

type TextButtonProps = ButtonProps & {
  label: string
}

export default function TextButton({ label, ...props }: TextButtonProps) {
  return (
    <Button
      minWidth={'136px'}
      bg={'none'}
      justifyContent='flex-start'
      px={2}
      py={1}
      fontWeight='normal'
      h={'unset'}
      sx={{
        '& span:nth-of-type(2)': {
          marginLeft: 'auto',
        },
      }}
      {...props}
    >
      {label}
    </Button>
  )
}
