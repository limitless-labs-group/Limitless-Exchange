import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { Button, VStack, Text, Box, HStack } from '@chakra-ui/react'
import UnlockIcon from '@/resources/icons/unlocked.svg'
import LockIcon from '@/resources/icons/locked.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import Loader from '@/components/common/loader'
import CheckedIcon from '@/resources/icons/checked-icon.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import { AnimatePresence, motion } from 'framer-motion'
import { isMobile } from 'react-device-detect'
import { ButtonStatus } from '@/app/markets/[address]/components/trade-widgets/action-button'

const MotionBox = motion(Box)

interface ConfirmButtonProps {
  tokenTicker: string
  status: ButtonStatus
  setStatus: Dispatch<SetStateAction<ButtonStatus>>
  handleConfirmClicked: () => Promise<void>
  onApprove: () => Promise<void>
}

export default function ConfirmButton({
  tokenTicker,
  status,
  handleConfirmClicked,
  onApprove,
  setStatus,
}: ConfirmButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = async () => {
    if (status === 'unlock') {
      await onApprove()
    }
    if (status === 'confirm') {
      await handleConfirmClicked()
    }
  }

  const content = useMemo(() => {
    if (status === 'confirm' || status === 'transaction-broadcasted' || status === 'initial') {
      return (
        <AnimatePresence>
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            position='absolute'
            width='100%'
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            <VStack w='full' h='full' color='white' gap='8px' justifyContent='center'>
              <CheckedIcon width={16} height={16} />
              <Text {...paragraphMedium} color='white'>
                Confirm?
              </Text>
            </VStack>
          </MotionBox>
        </AnimatePresence>
      )
    }
    if (status === 'unlocking') {
      return (
        <>
          <Loader />
          <Text {...paragraphMedium} color='white'>
            Unlocking...
          </Text>
        </>
      )
    }
    return (
      <>
        {!isHovered ? <LockIcon width={16} height={16} /> : <UnlockIcon width={16} height={16} />}
        <Box>
          <Text {...paragraphMedium} color='white'>
            Unlock
          </Text>
          <Text {...paragraphMedium} color='white'>
            {tokenTicker}
          </Text>
        </Box>
      </>
    )
  }, [status, isHovered, tokenTicker])

  return (
    <HStack>
      <Button
        bg='rgba(255, 255, 255, 0.2)'
        w={isMobile ? '144px' : '124px'}
        h={isMobile ? '156px' : '136px'}
        _hover={{
          backgroundColor: 'transparent.300',
        }}
        _active={{
          background: 'unset',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setStatus('initial')}
        isDisabled={status === 'unlocking'}
      >
        <VStack w='full' h='full' color='white' gap='8px' justifyContent='center'>
          <CloseIcon width={16} height={16} />
          <Text {...paragraphMedium} color='white'>
            Nevermind
          </Text>
        </VStack>
      </Button>
      <Button
        bg='rgba(255, 255, 255, 0.2)'
        w={isMobile ? '144px' : '124px'}
        h={isMobile ? '156px' : '136px'}
        _hover={{
          backgroundColor: 'transparent.300',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        isDisabled={status === 'unlocking'}
      >
        <VStack w='full' h='full' color='white' gap='8px' justifyContent='center'>
          {content}
        </VStack>
      </Button>
    </HStack>
  )
}
