import { Button, IButton } from '@/components'
import { useAmplitude, useAuth } from '@/services'
import { OpenedEvent } from '@/types'

export const LogInButton = ({ children, ...props }: IButton) => {
  const { trackOpened } = useAmplitude()
  const { signIn } = useAuth()

  return (
    <Button
      colorScheme={'brand'}
      fontWeight={'bold'}
      onClick={() => {
        signIn()
        trackOpened(OpenedEvent.LoginWindowOpened)
      }}
      {...props}
    >
      {children ?? 'Sign In'}
    </Button>
  )
}
