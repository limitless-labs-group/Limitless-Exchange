import { Box, Text } from '@chakra-ui/react'
import { captionMedium, captionRegular } from '@/styles/fonts/fonts.styles'
import { PostSummaryText } from '@/types/blog'

interface SummaryProps {
  boldText: string
  textBlocks: PostSummaryText[]
}

export default function Summary({ boldText, textBlocks }: SummaryProps) {
  return (
    <Box borderTop='1px solid' borderColor='grey.200' py='24px'>
      <Text mb='24px'>
        <Text as='span' {...captionMedium}>
          {boldText}
        </Text>{' '}
        <Text as='span' {...captionRegular} color='grey.700'>
          {textBlocks[0].value}
        </Text>
      </Text>
      {textBlocks.slice(1).map((block, index) => (
        <Text key={index} mb='24px' {...captionRegular} color='grey.700'>
          {block.value}
        </Text>
      ))}
    </Box>
  )
}
