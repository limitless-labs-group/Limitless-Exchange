import { HStack, Text, TextProps } from '@chakra-ui/react'

type TextWithPixelsProps = TextProps & {
  text: string
}
export default function TextWithPixels({ text, ...props }: TextWithPixelsProps) {
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
      <Text {...props}>{parts[0]}</Text>
      <Text {...props} fontFamily='Neue Pixel Sans'>
        {parts[1]}
      </Text>
      <Text {...props}>{parts.slice(2)}</Text>
    </HStack>
  )
}
