import { Button } from '@chakra-ui/react'
import { LoginModalOptions } from '@privy-io/react-auth'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'

interface LoginButtonProps {
  login: (options?: LoginModalOptions | React.MouseEvent<any, any>) => void
}

export const LoginButton = ({ login }: LoginButtonProps) => {
  const { pushGA4Event } = useGoogleAnalytics()
  const signIn = () => {
    login()
    pushGA4Event(GAEvents.ClickLogin)
  }
  return (
    <Button onClick={signIn} variant='contained' w='full'>
      Sign in
    </Button>
  )
}
