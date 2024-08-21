import { Market, MarketGroup } from '@/types'
import { useTradingService } from '@/services'
import { MarketTradingForm } from './market-trading-form'
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
    <Modal title={title} isOpen={open} onClose={handleCloseModal} variant='blueModal'>
      <MarketTradingForm
        market={market}
        outcomeTokensPercent={outcomeTokensPercent}
        setSelectedMarket={setSelectedMarket}
        marketGroup={marketGroup}
      />
    </Modal>
  )
}
