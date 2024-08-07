import { Modal, ModalCloseButton } from '@chakra-ui/modal'
import { ModalBody, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { Market } from '@/types'
import { useTradingService } from '@/services'
import { MarketTradingForm } from './market-trading-form'
import { headline } from '@/styles/fonts/fonts.styles'

interface MarketTradingModalProps {
  open: boolean
  onClose: () => void
  title: string
  market: Market
  outcomeTokensPercent?: number[]
}

export function MarketTradingModal({
  open,
  onClose,
  title,
  market,
  outcomeTokensPercent,
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
        <ModalHeader {...headline} color='white' mb='16px'>
          {title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <MarketTradingForm market={market} outcomeTokensPercent={outcomeTokensPercent} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
