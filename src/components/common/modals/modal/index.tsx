import {
  Button,
  Modal as ChakraModal,
  ModalBody,
  ModalContent,
  ModalContentProps,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
} from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { h1Regular, headline } from '@/styles/fonts/fonts.styles'

export type IModal = ModalProps &
  ModalContentProps & {
    title?: string
    showCloseButton?: boolean
  }

export const Modal = ({
  title,
  showCloseButton = true,
  onClose,
  isOpen,
  children,
  isCentered = true,
  ...props
}: IModal) => (
  <ChakraModal onClose={onClose} isOpen={isOpen} isCentered={isCentered} variant='commonModal'>
    <ModalOverlay />
    <ModalContent {...props}>
      <ModalHeader display='flex' justifyContent='space-between' p={0}>
        <Text {...(isMobile ? { ...h1Regular } : { ...headline })} w={'full'} textAlign='left'>
          {title}
        </Text>
        {showCloseButton && (
          <Button
            w={'26px'}
            h={'26px'}
            color={'fontLight'}
            bg={'bgLight'}
            colorScheme={'none'}
            borderRadius={'full'}
            size={'xs'}
            fontSize={13}
            onClick={onClose}
            // transition={'0.2s'}
            // _hover={{ transform: 'scale(1.1)' }}
            // _active={{ transform: 'none' }}
          >
            ⛌
          </Button>
        )}
      </ModalHeader>
      <ModalBody p={0}>{children}</ModalBody>
    </ModalContent>
  </ChakraModal>
)
