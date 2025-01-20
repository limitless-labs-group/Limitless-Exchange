import { Button } from '@chakra-ui/react'
import { usePrivy } from '@privy-io/react-auth'
import { SignInEvent, useAmplitude } from '@/services'

export const LoginButton = () => {
  const { trackSignIn } = useAmplitude()
  const { login } = usePrivy()

  return (
    <Button
      onClick={async () => {
        login()
        trackSignIn(SignInEvent.SignIn)
      }}
      variant='contained'
      w='full'
    >
      Sign in
    </Button>
  )
}
