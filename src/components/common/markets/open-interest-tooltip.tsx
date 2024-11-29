import { Box, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { Tooltip } from '@/components/common/tooltip'
import QuestionIcon from '@/resources/icons/question-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function OpenInterestTooltip({ iconColor }: { iconColor: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Tooltip
      bg='background.90'
      border='unset'
      label={
        'Market value shows how much money is currently active in this market, representing all the predictions made so far'
      }
      placement='top-end'
      {...paragraphMedium}
      color='white'
      cursor='pointer'
      {...(isMobile
        ? {
            isOpen,
            onClose,
          }
        : {})}
    >
      <Box
        color={iconColor}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (isMobile) {
            isOpen ? onClose() : onOpen()
          }
        }}
      >
        <QuestionIcon />
      </Box>
    </Tooltip>
  )
}
