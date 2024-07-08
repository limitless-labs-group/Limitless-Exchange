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
import { Modal, ModalCloseButton } from '@chakra-ui/modal'

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
      size={'full'}
      variant='blueModal'
      isOpen={approveModalOpened}
      onClose={() => setApproveModalOpened(false)}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`Approve ${token?.symbol} (Base) spend`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <Text color='white'>
              In order to proceed with transaction you should approve token for smart-contract
              spend.
            </Text>
            <Button
              mt='24px'
              variant='contained'
              color='black'
              bg='white'
              w='full'
              isDisabled={status !== 'Ready'}
              isLoading={status === 'Loading'}
              onClick={handleApproveClicked}
            >
              Approve
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
