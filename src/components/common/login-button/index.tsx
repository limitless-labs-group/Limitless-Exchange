import { useAuth } from '@/services'
import { Button } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { isUserInUSA } from '@/utils'

export const LogInButton = () => {
  const { signIn } = useAuth()
  const isUsa = isUserInUSA()

  return isUsa ? (
    <></>
  ) : (
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
