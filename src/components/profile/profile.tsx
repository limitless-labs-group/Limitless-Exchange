import { Box } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { ProfileForm } from '@/components'

interface ProfileProps {
  isOpen: boolean
  onClose?: () => void
}

export function Profile({ isOpen, onClose }: ProfileProps) {
  return (
    <Box onClick={(e) => e.stopPropagation()} px={isMobile ? '16px' : 0}>
      <>{isOpen && <ProfileForm onClose={onClose} />}</>
    </Box>
  )
}
