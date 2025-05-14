import { Modal } from '@/components/common/modals/modal'
import UniswapWidget from '@/components/common/swap/uniswap-widget'

interface SwapModalProps {
  open: boolean
  onClose: () => void
}

export default function SwapModal({ open, onClose }: SwapModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <UniswapWidget defaultOutputTokenAddress='0x' />
    </Modal>
  )
}
