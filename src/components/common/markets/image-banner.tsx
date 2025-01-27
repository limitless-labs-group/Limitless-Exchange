import { Box, Image } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'

interface ImageBannerProps {
  categoryName: string
}

export const ImageBanner: React.FC<ImageBannerProps> = ({ categoryName }) => {
  return (
    <Box w='full' h={isMobile ? '120px' : '320px'} position='relative' overflow='hidden'>
      <Image
        src={`/politics.png`}
        alt={`${categoryName} category banner`}
        objectFit='cover'
        w='full'
        h='full'
      />
    </Box>
  )
}
