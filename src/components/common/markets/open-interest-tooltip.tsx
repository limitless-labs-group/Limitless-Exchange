import { Box } from '@chakra-ui/react'
import React from 'react'
import { Tooltip } from '@/components/common/tooltip'
import QuestionIcon from '@/resources/icons/question-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function OpenInterestTooltip() {
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
    >
      <Box color='transparent.700'>
        <QuestionIcon />
      </Box>
    </Tooltip>
  )
}
