import { Text, HStack } from '@chakra-ui/react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import type { TransactionReceipt } from 'viem'

import { Toast } from '@/components'
import { defaultChain } from '@/constants'
import { truncateEthAddress } from '@/utils'

interface IToastDeposit {
  receipt: TransactionReceipt
}

export const ToastDeposit = ({ receipt }: IToastDeposit) => (
  <Toast
    title={`Deposit is ${receipt.status == 'success' ? 'successful' : 'failed'}`}
    onClick={() =>
      window.open(
        `${defaultChain.blockExplorers.default.url}/tx/${receipt.transactionHash}`,
        '_blank',
        'noopener'
      )
    }
  >
    <Text>Tx hash: {truncateEthAddress(receipt.transactionHash)}</Text>
    <HStack>
      <Text>Open in explorer</Text>
      <FaExternalLinkAlt size={'14px'} />
    </HStack>
  </Toast>
)
