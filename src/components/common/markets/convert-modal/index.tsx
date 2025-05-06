'use client'

import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import ConvertModalContent from '@/components/common/markets/convert-modal/convert-modal-content'
import { Modal } from '@/components/common/modals/modal'
import { useTradingService } from '@/services'

export default function ConvertModal() {
  const { convertModalOpened, setConvertModalOpened } = useTradingService()
  const [step, setStep] = useState(1)

  const handleModalClose = () => {
    setStep(1)
    setConvertModalOpened(false)
  }

  return (
    <Modal
      size={'sm'}
      title={step === 1 ? 'Convert Positions' : 'Review'}
      isOpen={convertModalOpened}
      onClose={handleModalClose}
      h={isMobile ? 'full' : 'unset'}
      marginTop={isMobile ? '36px' : 'auto'}
    >
      <ConvertModalContent step={step} setStep={setStep} />
    </Modal>
  )
}
