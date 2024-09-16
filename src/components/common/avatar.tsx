import { createAvatar } from '@dicebear/core'
import { pixelArt } from '@dicebear/collection'
import { isMobile } from 'react-device-detect'
import { Image as ChakraImage } from '@chakra-ui/react'

interface AvatarProps {
  account: string
  avatarUrl?: string
  size?: number
}

export default function Avatar({ account, avatarUrl, size = 4 }: AvatarProps) {
  const avatarSize = isMobile ? size * 1.5 : size
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

  console.log(svg)

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
