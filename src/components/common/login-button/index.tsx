import { Button } from '@chakra-ui/react'
import { LoginModalOptions } from '@privy-io/react-auth'
import useGoogleAnalytics from '@/services/GoogleAnalytics'

interface LoginButtonProps {
  login: (options?: LoginModalOptions | React.MouseEvent<any, any>) => void
}

export const LoginButton = ({ login }: LoginButtonProps) => {
  const ga = useGoogleAnalytics()
  const signIn = () => {
    login()
    ga.pushEvent({ event: 'GA4_event', event_name: 'click_login' })
  }
  return (
    <Button onClick={signIn} variant='contained' w='full'>
      Sign in
    </Button>
  )
}
