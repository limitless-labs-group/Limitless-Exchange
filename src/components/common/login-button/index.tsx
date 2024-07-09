import { useAuth } from '@/services'
import { Button } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'

export const LogInButton = () => {
  const { signIn } = useAuth()

  return (
    <Button
      variant={'contained'}
      py='4px'
      onClick={signIn}
      w='full'
      h='unset'
      my={isMobile ? '0' : '16px'}
    >
      Sign In
    </Button>
  )
}
