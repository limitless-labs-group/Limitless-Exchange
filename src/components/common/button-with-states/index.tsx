import { Box, Button, ButtonProps } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { MutationStatus } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import Loader from '@/components/common/loader'
import CheckedIcon from '@/resources/icons/checked-icon.svg'

const MotionBox = motion(Box)

type ButtonWithStatesProps = ButtonProps & {
  status: MutationStatus
  onReset?: () => Promise<void>
}

export default function ButtonWithStates({
  children,
  status,
  onReset,
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
            </MotionBox>
          </AnimatePresence>
        )
      default:
        return children
    }
  }, [status, children])

  const resetButtonState = async () => {
    await sleep(3)
    onReset && (await onReset())
  }

  useEffect(() => {
    if (status === 'success') {
      resetButtonState()
    }
  }, [status])

  // const refreshToInitial = async () => {
  //   await sleep(2)
  //   setState('initial')
  // }

  // useEffect(() => {
  //   if (isLoading) {
  //     setState('loading')
  //     return
  //   }
  //   if (state === 'initial') {
  //     return
  //   }
  //   if (state === 'success') {
  //     refreshToInitial()
  //     return
  //   }
  //   if (isSuccess) {
  //     setState('success')
  //     return
  //   }
  // }, [isLoading, state, isSuccess])

  return <Button {...props}>{buttonContent}</Button>
}
