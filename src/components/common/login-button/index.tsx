import { Button } from '@chakra-ui/react'
import { LoginModalOptions } from '@privy-io/react-auth'

interface LoginButtonProps {
  login: (options?: LoginModalOptions | React.MouseEvent<any, any>) => void
}

export const LoginButton = ({ login }: LoginButtonProps) => {
  return (
    <Button onClick={login} variant='contained' w='full'>
      Sign in
    </Button>
  )
}
