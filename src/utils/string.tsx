import { Link } from '@chakra-ui/react'

export const cutUsername = (username: string, value = 10) => {
  if (username.length <= value) {
    return username
  }
  return `${username.slice(0, value)}...`
}

export const parseTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <Link key={index} href={part} color='teal.500' isExternal>
          {part}
        </Link>
      )
    }
    return part
  })
}
