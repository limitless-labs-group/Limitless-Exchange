import { Box } from '@chakra-ui/react'

export interface IOverlay {
  show: boolean
  onClose: () => void
}

export const Overlay = ({ show, onClose }: IOverlay) => {
  return (
    <>
      {show && (
        <Box
          zIndex={99}
          top='0px'
          pos='absolute'
          h='100%'
          w='full'
          bg='black'
          opacity={0.5}
          onClick={onClose}
        />
      )}
    </>
  )
}
