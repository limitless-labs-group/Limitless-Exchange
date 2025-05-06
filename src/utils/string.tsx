import { Link } from '@chakra-ui/react'

export const cutUsername = (username: string, value = 10) => {
  if (!username) return ''
  if (username.length <= value) {
    return username
  }
  return `${username.slice(0, value)}...`
}

export const parseTextWithLinks = (text: string, partText?: string, linkVariant?: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <Link key={index} href={part} variant={linkVariant || 'textLink'} isExternal>
          {partText || part}
        </Link>
      )
    }
    return part
  })
}

export const uppercaseFirstLetter = (word: string) => {
  return `${word[0].toUpperCase()}${word.slice(1)}`
}
