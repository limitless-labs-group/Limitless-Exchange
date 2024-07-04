import { Modal, ModalCloseButton } from '@chakra-ui/modal'
import { ModalBody, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { MarketTradingForm } from '@/app/markets/[address]/components'
import { Market } from '@/types'

interface MarketTradingModalProps {
  open: boolean
  onClose: () => void
  title: string
  market: Market
}

export default function MarketTradingModal({
  open,
  onClose,
  title,
  market,
}: MarketTradingModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose} size='full' variant='blueModal'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <MarketTradingForm market={market} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
