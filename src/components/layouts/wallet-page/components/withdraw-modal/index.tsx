import React from 'react'
import { IModal, Modal } from '@/components/common/modals/modal'
import Withdraw from '@/components/layouts/wallet-page/components/withdraw'

type WithdrawModalProps = Omit<IModal, 'children'>

export const WithdrawModal = ({ onClose, isOpen }: WithdrawModalProps) => {
  return (
    <Modal title={`Withdraw crypto`} isOpen={isOpen} onClose={onClose}>
      <Withdraw onClose={onClose} isOpen={isOpen} />
    </Modal>
  )
}
