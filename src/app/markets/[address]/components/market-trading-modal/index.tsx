import { Modal, ModalCloseButton } from '@chakra-ui/modal'
import { ModalBody, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { MarketTradingForm } from '@/app/markets/[address]/components'
import { Market } from '@/types'
import { useTradingService } from '@/services'

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
  const { setCollateralAmount } = useTradingService()

  const handleCloseModal = () => {
    setCollateralAmount('')
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={handleCloseModal} size='full' variant='blueModal'>
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
