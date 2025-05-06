import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import Loader from '@/components/common/loader'
import { ButtonStatus } from '@/app/(markets)/markets/[address]/components/trade-widgets/action-button'
import CheckedIcon from '@/resources/icons/checked-icon.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import LockIcon from '@/resources/icons/locked.svg'
import UnlockIcon from '@/resources/icons/unlocked.svg'
import { ClickEvent, useAmplitude } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { commonButtonProps } from '@/styles/button'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

// @ts-ignore
const MotionBox = motion(Box)

interface ConfirmButtonProps {
  tokenTicker: string
  status: ButtonStatus
  setStatus: Dispatch<SetStateAction<ButtonStatus>>
  handleConfirmClicked: () => Promise<void>
  onApprove: () => Promise<void>
  analyticParams?: { source: string }
  marketAddress: Address
  outcome: 'Yes' | 'No'
  showFullInfo: boolean
}

export default function ConfirmButton({
  tokenTicker,
  status,
  handleConfirmClicked,
  onApprove,
  setStatus,
  analyticParams,
  marketAddress,
  outcome,
  showFullInfo,
}: ConfirmButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const { trackClicked } = useAmplitude()
  const { client } = useWeb3Service()

  const handleClick = async () => {
    if (status === 'unlock') {
      await onApprove()
    }
    if (status === 'confirm') {
      await handleConfirmClicked()
    }
  }

  const handleNevermindClicked = () => {
    trackClicked(ClickEvent.NevermindButtonClicked, {
      ...(analyticParams ? analyticParams : {}),
      address: marketAddress,
      outcome,
      strategy: 'Buy',
      walletType: client,
    })
    setStatus('initial')
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
            Unlock {tokenTicker}
          </Text>
        </Box>
      </>
    )
  }, [status, isHovered, tokenTicker])

  const colors = {
    Yes: {
      main: 'green.500',
      hover: 'green.300',
    },
    No: {
      main: 'red.500',
      hover: 'red.300',
    },
  }

  return (
    <HStack>
      <Button
        {...commonButtonProps}
        bg={colors[outcome].main}
        w={isMobile ? '144px' : '124px'}
        h={showFullInfo ? '118px' : '66px'}
        _hover={{
          backgroundColor: colors[outcome].hover,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleNevermindClicked}
        isDisabled={status === 'unlocking'}
        sx={{
          WebkitTapHighlightColor: 'transparent !important',
        }}
      >
        <VStack w='full' h='full' color='white' gap='8px' justifyContent='center'>
          <CloseIcon width={16} height={16} />
          <Text {...paragraphMedium} color='white'>
            Nevermind
          </Text>
        </VStack>
      </Button>
      <Button
        {...commonButtonProps}
        bg={colors[outcome].main}
        w={isMobile ? '144px' : '124px'}
        h={showFullInfo ? '118px' : '66px'}
        _hover={{
          backgroundColor: colors[outcome].hover,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        isDisabled={status === 'unlocking'}
        sx={{
          WebkitTapHighlightColor: 'transparent !important',
        }}
      >
        <VStack w='full' h='full' color='white' gap='8px' justifyContent='center'>
          {content}
        </VStack>
      </Button>
    </HStack>
  )
}
