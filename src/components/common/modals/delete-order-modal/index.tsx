import { Box, Button, Text } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { Modal } from '@/components/common/modals/modal'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

interface DeleteOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onDeleteOrder: () => Promise<void>
}

export default function DeleteOrderModal({
  isOpen,
  onClose,
  onDeleteOrder,
}: DeleteOrderModalProps) {
  const modalContent = (
    <Box>
      <Text {...paragraphRegular} my='12px'>
        Are you sure you want to delete this order?
      </Text>
      <Button
        variant='contained'
        onClick={async () => {
          await onDeleteOrder()
          onClose()
        }}
      >
        Delete
      </Button>
    </Box>
  )
  return isMobile ? (
    modalContent
  ) : (
    <Modal isOpen={isOpen} onClose={onClose} title='Delete order' h={'unset'} mt={'auto'}>
      {modalContent}
    </Modal>
  )
}
