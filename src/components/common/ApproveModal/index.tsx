import { Text, VStack } from '@chakra-ui/react'
import type { Address } from 'viem'

import type { ClickedApproveMetadata } from '@/services'
import { ClickEvent, useAmplitude, useBalanceService, useTradingService } from '@/services'
import { Button, Modal } from '@/components'
import { useWalletAddress } from '@/hooks/use-wallet-address'

type ApproveModalProps = {
  onApprove: () => Promise<void>
}

export default function ApproveModal({ onApprove }: ApproveModalProps) {
  const { approveModalOpened, setApproveModalOpened, status } = useTradingService()
  const { token } = useBalanceService()
  const { trackClicked } = useAmplitude()
  const address = useWalletAddress()

  const handleApproveClicked = async () => {
    trackClicked<ClickedApproveMetadata>(ClickEvent.ApproveClicked, {
      address: address as Address,
    })
    await onApprove()
    setApproveModalOpened(false)
  }

  return (
    <Modal
      size={'sm'}
      title={`Approve ${token.symbol} (Base) spend`}
      isOpen={approveModalOpened}
      onClose={() => setApproveModalOpened(false)}
      isCentered={false}
      maxW='460px'
    >
      <VStack>
        <Text>
          In order to proceed with transaction you should approve token for smart-contract spend.
        </Text>
        <Button
          mt='24px'
          colorScheme={'brand'}
          isDisabled={status !== 'Ready'}
          isLoading={status === 'Loading'}
          onClick={handleApproveClicked}
        >
          Approve
        </Button>
      </VStack>
    </Modal>
  )
}
