import { Avatar as ChakraAvatar, AvatarProps } from '@chakra-ui/react'
import { pixelArt } from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'

type AvatarCustomProps = AvatarProps & {
  account: string
  avatarUrl?: string | null
}

export default function Avatar({ account, avatarUrl, ...props }: AvatarCustomProps) {
  if (avatarUrl) {
    return (
      <ChakraAvatar
        src={avatarUrl}
        width={props.size || '16px'}
        height={props.size || '16px'}
        {...props}
      />
    )
  }

  const avatar = createAvatar(pixelArt, {
    seed: account,
  })

  const svg = avatar.toDataUri()

  return (
    <ChakraAvatar src={svg} width={props.size || '16px'} height={props.size || '16px'} {...props} />
  )
}
