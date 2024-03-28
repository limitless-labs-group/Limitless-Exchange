import { Toast } from '@/components'
import { defaultChain } from '@/constants'
import { truncateEthAddress } from '@/utils'
import { Text, HStack } from '@chakra-ui/react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { TransactionReceipt } from 'viem'

interface IToastWithdraw {
  receipt?: TransactionReceipt
}

export const ToastWithdraw = ({ receipt }: IToastWithdraw) => (
  <Toast
    title={`Withdrawal is ${receipt?.status == 'reverted' ? 'failed' : 'successful'}`}
    onClick={() =>
      window.open(
        `${defaultChain.blockExplorers.default.url}/tx/${receipt?.transactionHash}`,
        '_blank'
      )
    }
  >
    <Text>Tx hash: {truncateEthAddress(receipt?.transactionHash)}</Text>
    <HStack>
      <Text>Open in explorer</Text>
      <FaExternalLinkAlt size={'14px'} />
    </HStack>
  </Toast>
)
