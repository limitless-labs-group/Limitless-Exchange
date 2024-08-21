import {
  ClickedApproveMetadata,
  ClickEvent,
  useAmplitude,
  useBalanceService,
  useTradingService,
} from '@/services'
import {
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  Button,
} from '@chakra-ui/react'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { Address } from 'viem'
import { ModalCloseButton } from '@chakra-ui/modal'
import { isMobile } from 'react-device-detect'
import Loader from '@/components/common/loader'
import React from 'react'
import { Modal } from '@/components/common/modals/modal'

type ApproveModalProps = {
  onApprove: () => Promise<void>
}

export default function ApproveModal({ onApprove }: ApproveModalProps) {
  const { approveModalOpened, setApproveModalOpened, status } = useTradingService()
  const { token } = useBalanceService()
  const { trackClicked } = useAmplitude()
  const address = useWalletAddress()

  const handleApproveClicked = async () => {
    trackClicked(ClickEvent.SellApproveClicked, {
      address: address as Address,
    })
    await onApprove()
    setApproveModalOpened(false)
  }

  return (
    <Modal
      variant='commonModal'
      isOpen={approveModalOpened}
      onClose={() => setApproveModalOpened(false)}
      title={`Approve ${token?.symbol} (Base) spend`}
    >
      <VStack mt='24px'>
        <Text>
          In order to proceed with transaction you should approve token for smart-contract spend.
        </Text>
        <Button
          mt='24px'
          variant={'contained'}
          w='full'
          isDisabled={status !== 'Ready'}
          isLoading={status === 'Loading'}
          spinner={<Loader />}
          onClick={handleApproveClicked}
        >
          Approve
        </Button>
      </VStack>
    </Modal>
  )
}
