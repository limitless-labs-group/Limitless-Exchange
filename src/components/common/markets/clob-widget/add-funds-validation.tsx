import { Text } from '@chakra-ui/react'
import { useBalanceService } from '@/services'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export const AddFundsValidation = () => {
  const { overallBalanceUsd } = useBalanceService()
  return (
    <Text my='8px' {...paragraphRegular} color='orange.50' textAlign={'center'}>
      {`Your balance is ~${NumberUtil.formatThousands(overallBalanceUsd, 2)} USD`}
    </Text>
  )
}
