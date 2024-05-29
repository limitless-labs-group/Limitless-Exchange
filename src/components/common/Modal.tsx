import { borderRadius } from '@/styles'
import {
  Button,
  Heading,
  Modal as ChakraModal,
  ModalBody,
  ModalContent,
  ModalContentProps,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react'

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
  size,
  isCentered = true,
  ...props
}: IModal) => (
  <ChakraModal onClose={onClose} isOpen={isOpen} size={size} isCentered={isCentered}>
    <ModalOverlay />
    <ModalContent
      borderRadius={borderRadius}
      bg={'bg'}
      p={'20px 20px 24px'}
      mx={{ sm: '8px', md: '20px' }}
      gap={8}
      // boxShadow={'0 0 300px #500'}
      {...props}
    >
      <ModalHeader display='flex' justifyContent='space-between' p={0}>
        <Heading fontSize={{ sm: '20px', md: '24px' }} w={'full'} textAlign='left'>
          {title}
        </Heading>
        {showCloseButton && (
          <Button
            w={'26px'}
            h={'26px'}
            color={'fontLight'}
            bg={'bgLight'}
            variant={'gray'}
            borderRadius={'full'}
            size={'xs'}
            fontSize={13}
            onClick={onClose}
          >
            ⛌
          </Button>
        )}
      </ModalHeader>
      <ModalBody p={0}>{children}</ModalBody>
    </ModalContent>
  </ChakraModal>
)
