import { Button, HStack } from '@chakra-ui/react'
import { LoginModalOptions } from '@privy-io/react-auth'
import { SignInEvent, useAmplitude } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'

interface LoginButtonProps {
  login: (options?: LoginModalOptions | React.MouseEvent<any, any>) => void
}

export const LoginButtons = ({ login }: LoginButtonProps) => {
  const { pushGA4Event } = useGoogleAnalytics()
  const { trackSignIn } = useAmplitude()
  const signIn = (event: SignInEvent) => {
    login()
    trackSignIn(event)
    pushGA4Event(GAEvents.ClickLogin)
  }
  return (
    <HStack gap='8px'>
      <Button onClick={() => signIn(SignInEvent.LogIn)} variant='outlined'>
        Login
      </Button>
      <Button onClick={() => signIn(SignInEvent.SignUp)} variant='contained'>
        Sign Up
      </Button>
    </HStack>
  )
}
