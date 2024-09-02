import { Heading, Text, TextProps } from '@chakra-ui/react'

type TextWithPixelsProps = TextProps & {
  text: string
  highlightWord?: number
}
export default function TextWithPixels({ text, highlightWord = 2, ...props }: TextWithPixelsProps) {
  const parts = text.split(' ')
  if (parts.length === 2 && !highlightWord) {
    return (
      <>
        <Text as='span' {...props}>
          {parts[0]}{' '}
        </Text>
        <Heading as='span' {...props}>
          {parts[1]}{' '}
        </Heading>
      </>
    )
  }

  return (
    <>
      <Text as='span' {...props}>
        {parts.slice(0, highlightWord - 1).join(' ')}{' '}
      </Text>
      <Heading as='span' {...props}>
        {parts[highlightWord - 1]}{' '}
      </Heading>
      <Text as='span' {...props}>
        {parts.slice(highlightWord).join(' ')}
      </Text>
    </>
  )
}
