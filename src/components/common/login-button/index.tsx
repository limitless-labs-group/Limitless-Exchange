import { Button } from '@chakra-ui/react'
import { LoginModalOptions } from '@privy-io/react-auth'
import { SignInEvent, useAmplitude } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'

interface LoginButtonProps {
  login: (options?: LoginModalOptions | React.MouseEvent<any, any>) => void
}

export const LoginButton = ({ login }: LoginButtonProps) => {
  const { pushGA4Event } = useGoogleAnalytics()
  const { trackSignIn } = useAmplitude()
  const signIn = () => {
    login()
    trackSignIn(SignInEvent.SignIn)
    pushGA4Event(GAEvents.ClickLogin)
  }
  return (
    <Button onClick={signIn} variant='contained' w='full'>
      Sign in
    </Button>
  )
}
