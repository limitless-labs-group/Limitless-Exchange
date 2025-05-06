import ButtonWithStates, {
  ButtonWithStatesProps,
} from 'src/components/common/buttons/button-with-states'

export default function ClobTradeButton({
  status,
  children,
  isBlocked,
  ...props
}: ButtonWithStatesProps) {
  return (
    <ButtonWithStates
      {...props}
      status={status}
      bg={isBlocked ? 'red.500' : status === 'success' ? 'green.500' : 'blue.500'}
      color='white'
      whiteSpace='normal'
      w='full'
      h={isBlocked ? '90px' : '64px'}
      _disabled={
        !isBlocked
          ? {
              bg: 'grey.300',
              color: 'grey.500',
            }
          : undefined
      }
    >
      {children}
    </ButtonWithStates>
  )
}
