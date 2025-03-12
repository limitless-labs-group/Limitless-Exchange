import React from 'react'
import { isMobile } from 'react-device-detect'
import { IModal, Modal } from '@/components/common/modals/modal'
import Withdraw from '@/components/layouts/wallet-page/components/withdraw'

type WithdrawModalProps = Omit<IModal, 'children'>

export const WithdrawModal = ({ onClose, isOpen, ...props }: WithdrawModalProps) => {
  return (
    <Modal
      size={'md'}
      title={`Withdraw crypto`}
      isOpen={isOpen}
      onClose={onClose}
      h={isMobile ? 'full' : 'unset'}
      marginTop={isMobile ? '36px' : 'auto'}
      {...props}
    >
      <Withdraw isOpen={isOpen} />
    </Modal>
  )
}
