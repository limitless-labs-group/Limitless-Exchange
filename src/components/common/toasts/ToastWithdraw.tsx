import { Text, HStack } from '@chakra-ui/react'
import { FaExternalLinkAlt } from 'react-icons/fa'

import { Toast } from '@/components'
import { defaultChain } from '@/constants'
import { truncateEthAddress } from '@/utils'

interface IToastWithdraw {
  transactionHash: string
}

export const ToastWithdraw = ({ transactionHash }: IToastWithdraw) => (
  <Toast
    title='Withdrawal is successful'
    onClick={() =>
      window.open(
        `${defaultChain.blockExplorers.default.url}/tx/${transactionHash}`,
        '_blank',
        'noopener'
      )
    }
  >
    <Text>Tx hash: {truncateEthAddress(transactionHash)}</Text>
    <HStack>
      <Text>Open in explorer</Text>
      <FaExternalLinkAlt size={'14px'} />
    </HStack>
  </Toast>
)
