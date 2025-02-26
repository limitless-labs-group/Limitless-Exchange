import ButtonWithStates, { ButtonWithStatesProps } from '@/components/common/button-with-states'

export default function ClobTradeButton({ status, children, ...props }: ButtonWithStatesProps) {
  return (
    <ButtonWithStates
      {...props}
      status={status}
      bg={status === 'success' ? 'green.500' : 'blue.500'}
      color='white'
      w='full'
      h='64px'
      _disabled={{
        bg: 'grey.300',
        color: 'grey.500',
      }}
    >
      {children}
    </ButtonWithStates>
  )
}
