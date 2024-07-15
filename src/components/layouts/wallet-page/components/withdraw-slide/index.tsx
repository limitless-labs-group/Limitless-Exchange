import { Slide } from '@chakra-ui/react'
import Widthdraw from 'src/components/layouts/wallet-page/components/withdraw'
import { IModal } from '@/components/common/modals/modal'

type WithdrawSlideProps = Omit<IModal, 'children'>

export default function WithdrawSlide({ isOpen, onClose }: WithdrawSlideProps) {
  return (
    <Slide
      direction='top'
      in={isOpen}
      style={{
        zIndex: 150,
        paddingTop: isOpen ? '60px' : 0,
        height: '100%',
      }}
      onClick={() => {
        onClose()
      }}
    >
      <Widthdraw isOpen={isOpen} onClose={onClose} />
    </Slide>
  )
}
