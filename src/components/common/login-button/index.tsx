import { useAuth } from '@/services'
import { Button } from '@chakra-ui/react'

export const LogInButton = () => {
  const { signIn } = useAuth()

  return (
    <Button variant={'contained'} py='4px' onClick={signIn} w='full' h='unset' my='16px'>
      Sign In
    </Button>
  )
}
