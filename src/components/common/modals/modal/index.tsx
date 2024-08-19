import {
  Box,
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
import GrabberIcon from '@/resources/icons/grabber-icon.svg'
import { useRef, useState } from 'react'

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
}: IModal) => {
  const [startY, setStartY] = useState(null)
  const [currentY, setCurrentY] = useState(null)
  const [translateY, setTranslateY] = useState(0)
  const modalContentRef = useRef(null)

  // @ts-ignore
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY)
  }

  // @ts-ignore
  const handleTouchMove = (e) => {
    const moveY = e.touches[0].clientY
    setCurrentY(moveY)
    if (startY !== null) {
      const diffY = moveY - startY
      setTranslateY(diffY > 0 ? diffY : 0)
    }
  }

  const handleTouchEnd = () => {
    if (startY !== null && currentY !== null && currentY - startY > 50) {
      onClose()
    }
    setStartY(null)
    setCurrentY(null)
    setTranslateY(0)
  }

  return (
    <ChakraModal onClose={onClose} isOpen={isOpen} isCentered={isCentered} variant={variant}>
      <ModalOverlay />
      <ModalContent
        {...props}
        mt={isMobile ? '40px' : 'auto'}
        h={isMobile ? 'full' : 'unset'}
        ref={modalContentRef}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: 'transform 0.1s ease-out',
        }}
        as={'div'}
      >
        {isMobile && (
          <Box
            display='flex'
            justifyContent='center'
            py='8px'
            color={!translateY ? 'grey.300' : 'grey.800'}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <GrabberIcon />
          </Box>
        )}
        <ModalHeader display='flex' justifyContent='space-between'>
          <Text
            {...(isMobile
              ? { ...h1Regular, fontSize: '20px', lineHeight: '24px' }
              : { ...headline })}
            w={'full'}
            textAlign='left'
          >
            {title}
          </Text>
          {!isMobile && (
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
}
