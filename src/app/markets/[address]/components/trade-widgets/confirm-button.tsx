import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { Button, VStack, Text, Box } from '@chakra-ui/react'
import UnlockIcon from '@/resources/icons/unlocked.svg'
import LockIcon from '@/resources/icons/locked.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import Loader from '@/components/common/loader'
import CheckedIcon from '@/resources/icons/checked-icon.svg'
import { AnimatePresence, motion } from 'framer-motion'

const MotionBox = motion(Box)

interface ConfirmButtonProps {
  tokenTicker: string
  status: string
  setStatus: Dispatch<SetStateAction<string>>
  handleConfirmClicked: () => Promise<void>
  onApprove: () => Promise<void>
}

export default function ConfirmButton({
  tokenTicker,
  status,
  handleConfirmClicked,
  setStatus,
  onApprove,
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
    if (status === 'confirm') {
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
            <VStack w='full' h='full' color='grey.50' gap='8px' justifyContent='center'>
              <CheckedIcon width={16} height={16} />
              <Text {...paragraphMedium} color='grey.50'>
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
          <Text {...paragraphMedium} color='grey.50'>
            Unlocking...
          </Text>
        </>
      )
    }
    return (
      <>
        {!isHovered ? <LockIcon width={16} height={16} /> : <UnlockIcon width={16} height={16} />}
        <Box>
          <Text {...paragraphMedium} color='grey.50'>
            Unlock
          </Text>
          <Text {...paragraphMedium} color='grey.50'>
            {tokenTicker}
          </Text>
        </Box>
      </>
    )
  }, [status, isHovered, tokenTicker])

  return (
    <Button
      bg='rgba(255, 255, 255, 0.2)'
      w='112px'
      h='136px'
      _hover={{
        backgroundColor: 'transparent.300',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      isDisabled={status === 'unlocking'}
    >
      <VStack w='full' h='full' color='grey.50' gap='8px' justifyContent='center'>
        {content}
      </VStack>
    </Button>
  )
}
