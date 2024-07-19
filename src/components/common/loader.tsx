import LoadingIcon from '@/resources/icons/loader-icon.svg'
import React from 'react'
import '../../../src/app/style.css'
import { Box } from '@chakra-ui/react'

export default function Loader() {
  return (
    <Box animation='rotateInfinite 1.4s linear 0s infinite normal none running'>
      <LoadingIcon width={16} height={16} />
    </Box>
  )
}
