import { Box } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { ProfileForm } from '@/components'
import { useAccount } from '@/services'

export function Profile() {
  const { profilePageOpened } = useAccount()
  return (
    <Box onClick={(e) => e.stopPropagation()} px={isMobile ? '16px' : 0}>
      <>{profilePageOpened && <ProfileForm />}</>
    </Box>
  )
}
