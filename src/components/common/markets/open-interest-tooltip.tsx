import { Box, useDisclosure, useOutsideClick } from '@chakra-ui/react'
import React, { MutableRefObject, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import { Tooltip } from '@/components/common/tooltip'
import QuestionIcon from '@/resources/icons/question-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function OpenInterestTooltip({ iconColor }: { iconColor: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const ref = useRef<HTMLElement>()

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => {
      isMobile && onClose()
    },
  })

  return (
    <Tooltip
      bg='transparent.70'
      border='unset'
      label={
        'Market value shows how much money is currently active in this market, representing all the predictions made so far'
      }
      openDelay={500}
      placement='top-end'
      {...paragraphMedium}
      color='grey.800'
      {...(isMobile
        ? {
            isOpen,
            onClose,
          }
        : {})}
    >
      <Box
        color={iconColor}
        cursor='pointer'
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          isMobile && onOpen()
        }}
      >
        <QuestionIcon />
      </Box>
    </Tooltip>
  )
}
