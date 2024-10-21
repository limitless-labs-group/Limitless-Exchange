import { Image as ChakraImage } from '@chakra-ui/react'
import { pixelArt } from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'
import { isMobile } from 'react-device-detect'

interface AvatarProps {
  account: string
  avatarUrl?: string
  size?: number
}

export default function Avatar({ account, avatarUrl, size = 4 }: AvatarProps) {
  const avatarSize = isMobile ? `${size * 4}px` : size
  if (avatarUrl) {
    return (
      <ChakraImage
        width={avatarSize}
        height={avatarSize}
        src={avatarUrl}
        alt='avatar'
        borderRadius={'2px'}
      />
    )
  }

  const avatar = createAvatar(pixelArt, {
    seed: account,
  })

  const svg = avatar.toDataUri()

  return (
    <ChakraImage
      width={avatarSize}
      height={avatarSize}
      src={svg}
      alt='avatar'
      borderRadius={'2px'}
    />
  )
}
