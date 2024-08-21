import { ModalCloseButton } from '@chakra-ui/modal'
import { ModalBody, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { Market, MarketGroup } from '@/types'
import { useTradingService } from '@/services'
import { MarketTradingForm } from './market-trading-form'
import { headline } from '@/styles/fonts/fonts.styles'
import { Modal } from '@/components/common/modals/modal'

interface MarketTradingModalProps {
  open: boolean
  onClose: () => void
  title: string
  market: Market
  outcomeTokensPercent?: number[]
  setSelectedMarket?: (market: Market) => void
  marketGroup?: MarketGroup
}

export function MarketTradingModal({
  open,
  onClose,
  title,
  market,
  outcomeTokensPercent,
  setSelectedMarket,
  marketGroup,
}: MarketTradingModalProps) {
  const { setCollateralAmount } = useTradingService()

  const handleCloseModal = () => {
    setCollateralAmount('')
    onClose()
  }

  return (
    <Modal title={title} isOpen={open} onClose={handleCloseModal} size='full' variant='blueModal'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader {...headline} color='white' mb='16px'>
          {title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <MarketTradingForm
            market={market}
            outcomeTokensPercent={outcomeTokensPercent}
            setSelectedMarket={setSelectedMarket}
            marketGroup={marketGroup}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
