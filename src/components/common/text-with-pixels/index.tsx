import { HStack, Text, TextProps } from '@chakra-ui/react'

type TextWithPixelsProps = TextProps & {
  text: string
  highlightWord?: number
}
export default function TextWithPixels({ text, highlightWord = 2, ...props }: TextWithPixelsProps) {
  const parts = text.split(' ')
  if (parts.length === 2) {
    return (
      <HStack gap={'2px'}>
        <Text {...props}>{parts[0]}</Text>
        <Text {...props} fontFamily='Neue Pixel Sans'>
          {parts[1]}
        </Text>
      </HStack>
    )
  }

  return (
    <HStack gap={'2px'}>
      <Text {...props}>{parts.slice(0, highlightWord - 1).join(' ')}</Text>
      <Text {...props} fontFamily='Neue Pixel Sans'>
        {parts[highlightWord - 1]}
      </Text>
      <Text {...props}>{parts.slice(highlightWord).join(' ')}</Text>
    </HStack>
  )
}
