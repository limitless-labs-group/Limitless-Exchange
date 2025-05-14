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
import CloseIcon from '@/resources/icons/close-icon.svg'
import { h1Regular, headline } from '@/styles/fonts/fonts.styles'

export type IModal = ModalProps &
  ModalContentProps & {
    title?: string
  }

export const Modal = ({
  title,
  onClose,
  isOpen,
  children,
  isCentered = true,
  variant = 'commonModal',
  ...props
}: IModal) => (
  <ChakraModal onClose={onClose} isOpen={isOpen} isCentered={isCentered} variant={variant}>
    <ModalOverlay />
    <ModalContent {...props}>
      <ModalHeader display='flex' justifyContent='space-between' p={0}>
        <Text {...(isMobile ? { ...h1Regular } : { ...headline })} w={'full'} textAlign='left'>
          {title}
        </Text>
        {!isMobile && variant !== 'modalWithoutClose' && (
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
            minW='32px'
            // transition={'0.2s'}
            // _hover={{ transform: 'scale(1.1)' }}
            // _active={{ transform: 'none' }}
          >
            <CloseIcon width={16} height={16} />
          </Button>
        )}
      </ModalHeader>
      <ModalBody p={0}>{children}</ModalBody>
    </ModalContent>
  </ChakraModal>
)
