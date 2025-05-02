import { Button, IButton } from '@/components'
import { useAuth } from '@/services'

export const LogInButton = ({ children, ...props }: IButton) => {
  const { signIn } = useAuth()

  return (
    <Button
      colorScheme={'brand'}
      fontWeight={'bold'}
      onClick={() => {
        signIn()
      }}
      disabled
      {...props}
    >
      {children ?? 'Sign In'}
    </Button>
  )
}
