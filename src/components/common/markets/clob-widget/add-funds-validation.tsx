import { Text } from '@chakra-ui/react'
import { useClobWidget } from './context'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export const AddFundsValidation = () => {
  const { balance } = useClobWidget()

  return (
    <Text my='8px' {...paragraphRegular} color='orange.50' textAlign={'center'}>
      {`Your balance is ~${NumberUtil.formatThousands(balance, 2)} USD`}
    </Text>
  )
}
