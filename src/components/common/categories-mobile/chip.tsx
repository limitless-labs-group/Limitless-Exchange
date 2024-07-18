import React from 'react'
import { Box, Text } from '@chakra-ui/react'

export interface IChip {
  children: React.ReactNode
  selected: boolean
  onClick: () => void
}

export const Chip = ({ selected, onClick, children }: IChip) => {
  return (
    <Box
      bg={selected ? 'black' : 'grey.300'}
      color={selected ? 'grey.50' : 'grey.800'}
      py='5px'
      px='12px'
      borderRadius='2px'
      w='fit-content'
      mb='3px'
      cursor='pointer'
      onClick={onClick}
    >
      <Text color={selected ? 'grey.50' : 'grey.800'} fontWeight={500}>
        /{children}
      </Text>
    </Box>
  )
}
