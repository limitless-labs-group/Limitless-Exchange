import { Avatar as ChakraAvatar } from '@chakra-ui/react'
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
    return <ChakraAvatar width={avatarSize} height={avatarSize} src={avatarUrl} />
  }

  const avatar = createAvatar(pixelArt, {
    seed: account,
  })

  const svg = avatar.toDataUri()

  return <ChakraAvatar width={avatarSize} height={avatarSize} src={svg} />
}
