import { useDisclosure } from '@chakra-ui/react'
import { PanInfo } from 'framer-motion'

export const useBottomSheetDisclosure = () => {
  const { ...chakraDisclosure } = useDisclosure()

  const swipeConfidenceThreshold = 5000
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity

  const onDrag = async (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    console.log('info', info)
    const { offset, velocity } = info
    const swipe = swipePower(offset.y, velocity.y)
    if (offset.y > 0 && swipe > swipeConfidenceThreshold) chakraDisclosure.onClose()
  }

  return {
    ...chakraDisclosure,
    onDrag,
  }
}
