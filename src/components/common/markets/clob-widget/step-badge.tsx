import { Flex } from '@chakra-ui/react'
import React, { memo } from 'react'

type StepBadgeProps = {
  content: string
}

export const StepBadge = memo(({ content }: StepBadgeProps) => {
  return (
    <Flex
      borderRadius='999px'
      w='16px'
      h='16px'
      bg={'var(--chakra-colors-grey-800)'}
      alignItems='center'
      justifyContent='center'
      fontSize='12px'
      fontWeight='700'
      color='grey.100'
    >
      {content}
    </Flex>
  )
})

StepBadge.displayName = 'StepBadge'
