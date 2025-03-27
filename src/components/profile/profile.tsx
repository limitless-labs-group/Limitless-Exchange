import { Box } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { ProfileForm } from '@/components'

interface ProfileProps {
  isOpen: boolean
}

export function Profile({ isOpen }: ProfileProps) {
  return (
    <Box
      bg='grey.50'
      w={isMobile ? 'full' : '328px'}
      px={isMobile ? '16px' : '12px'}
      pt={isMobile ? 0 : '12px'}
      h='full'
      onClick={(e) => e.stopPropagation()}
      overflow='auto'
      marginLeft='auto'
    >
      {isOpen && <ProfileForm />}
    </Box>
  )
}
