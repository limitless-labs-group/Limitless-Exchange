import { Box, Button, ButtonProps, Text } from '@chakra-ui/react'
import { MutationStatus } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import Loader from '@/components/common/loader'
import CheckedIcon from '@/resources/icons/checked-icon.svg'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

// @ts-ignore
const MotionBox = motion(Box)

export type ButtonWithStatesProps = ButtonProps & {
  status: MutationStatus
  isBlocked?: boolean
  onReset?: () => Promise<void>
  successText?: string
}

export default function ButtonWithStates({
  children,
  status,
  onReset,
  successText,
  ...props
}: ButtonWithStatesProps) {
  const buttonContent = useMemo(() => {
    switch (status) {
      case 'pending':
        return <Loader />
      case 'success':
        return (
          <AnimatePresence>
            <MotionBox
              position='absolute'
              width='100%'
              display='flex'
              alignItems='center'
              gap='8px'
              justifyContent='center'
            >
              <CheckedIcon width={16} height={16} />
              {successText && (
                <Text {...paragraphRegular} color='white'>
                  {successText}
                </Text>
              )}
            </MotionBox>
          </AnimatePresence>
        )
      default:
        return children
    }
  }, [status, children, successText])

  const resetButtonState = async () => {
    onReset && (await onReset())
  }

  useEffect(() => {
    if (status === 'success') {
      resetButtonState()
    }
  }, [status])

  //avoid chakra's disabled styles
  const isDisabled = status === 'pending' || status === 'success'

  return (
    <Button {...props} pointerEvents={isDisabled ? 'none' : 'unset'}>
      {buttonContent}
    </Button>
  )
}
