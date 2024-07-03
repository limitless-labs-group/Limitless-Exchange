import { HStack, Text, TextProps } from '@chakra-ui/react'

type TextWithPixelsProps = TextProps & {
  text: string
  highlightWord?: number
}
export default function TextWithPixels({ text, highlightWord = 2, ...props }: TextWithPixelsProps) {
  const parts = text.split(' ')
  if (parts.length === 2) {
    return (
      <>
        <Text as='span' {...props}>
          {parts[0]}
        </Text>
        <Text fontFamily='pixels' as='span' {...props}>
          {parts[1]}{' '}
        </Text>
      </>
    )
  }

  return (
    <>
      <Text as='span' {...props}>
        {parts.slice(0, highlightWord - 1).join(' ')}{' '}
      </Text>
      <Text as='span' {...props} fontFamily='pixels'>
        {parts[highlightWord - 1]}{' '}
      </Text>
      <Text as='span' {...props}>
        {parts.slice(highlightWord).join(' ')}
      </Text>
    </>
  )
}
