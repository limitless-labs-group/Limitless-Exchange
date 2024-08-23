import { Toast } from '@/components/common/toast'
import { defaultChain } from '@/constants'
import { truncateEthAddress } from '@/utils'
import { Text, ToastId, Link } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

interface IToastWithdraw {
  transactionHash: string
  id: ToastId
}

export const ToastWithdraw = ({ transactionHash, id }: IToastWithdraw) => (
  <Toast
    title='Withdrawal is successful'
    text={`Tx hash: ${truncateEthAddress(transactionHash)}`}
    id={id}
  >
    <Link
      href={`${defaultChain.blockExplorers.default.url}/tx/${transactionHash}`}
      target='_blank'
      rel='norefferer'
      textDecoration='underline'
      mt={isMobile ? '24px' : '16px'}
    >
      <Text {...paragraphMedium}>Open in Explorer</Text>
    </Link>
  </Toast>
)
