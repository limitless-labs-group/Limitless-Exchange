import { Box, Image, Text, UnorderedList, ListItem, OrderedList } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import BlogTable from '@/app/blog/components/blog-table'
import MarketsSection from '@/app/blog/components/markets-section'
import Summary from '@/app/blog/components/summary'
import { h1Bold, h2Bold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import {
  BlogPostFile,
  BlogSection,
  BlogSectionType,
  PostMarketSlug,
  PostSummaryText,
  PostTable,
  PostTableRow,
  PostValue,
} from '@/types/blog'

interface ListItem {
  id: number
  value: string
}

interface PostSectionProps {
  block: BlogSection
}

export default function PostSection({ block }: PostSectionProps) {
  switch (block.__component) {
    case BlogSectionType.ARTICLE_TITLE:
      return (
        <Text {...(isMobile ? { ...h1Bold } : { ...h2Bold })} mb='24px'>
          {block.value as string}
        </Text>
      )
    case BlogSectionType.SECTION_TEXT:
      return (
        <Text mb='24px' {...paragraphRegular} color='grey.700'>
          {block.value as string}
        </Text>
      )
    case BlogSectionType.SECTION_DIVIDER:
      return <Box mt={isMobile ? '32px' : '48px'} />
    case BlogSectionType.SECTION_MEDIA:
      return (
        <Image
          src={`${process.env.NEXT_PUBLIC_BLOG_URL}${(block.file as BlogPostFile).url as string}`}
          h={isMobile ? '240px' : '368px'}
          objectFit='contain'
          borderRadius='12px'
          alt='post-image'
        />
      )
    case BlogSectionType.QUOTE:
      return (
        <Box borderLeft='1px solid' borderColor='grey.800' mb='24px'>
          <Box ml='24px'>
            <Text {...paragraphMedium} fontSize='16px'>
              {block.quoteText as string}
            </Text>
            <Text {...paragraphRegular} color='grey.500' mt='8px'>
              - {block.author as string}
            </Text>
          </Box>
        </Box>
      )
    case BlogSectionType.SECTION_SUBTITLE:
      return (
        <Text mb='24px' {...paragraphMedium} fontSize='16px'>
          {block.value as string}
        </Text>
      )
    case BlogSectionType.HIGHLIGHTED_TEXT:
      return (
        <Paper p='12px'>
          <Text {...paragraphMedium} color='grey.700'>
            {block.value as string}
          </Text>
        </Paper>
      )
    case BlogSectionType.UNNUMBERED_LIST:
      return (
        <UnorderedList mb='24px'>
          {(block.listItem as ListItem[]).map((item) => (
            <ListItem key={item.value} {...paragraphRegular} color='grey.700' mb='16px'>
              {item.value}
            </ListItem>
          ))}
        </UnorderedList>
      )
    case BlogSectionType.NUMBERED_LIST:
      return (
        <OrderedList mb='24px'>
          {(block.listItem as ListItem[]).map((item) => (
            <ListItem key={item.value} {...paragraphRegular} color='grey.700' mb='16px'>
              {item.value}
            </ListItem>
          ))}
        </OrderedList>
      )
    case BlogSectionType.MARKET_SECTION:
      return <MarketsSection slugs={block.slug as PostMarketSlug[]} />
    case BlogSectionType.SUMMARY:
      return (
        <Summary
          boldText={block.boldText as string}
          textBlocks={block.summaryText as PostSummaryText[]}
        />
      )
    case BlogSectionType.TABLE:
      return <BlogTable header={block.Header as PostValue[]} rows={block.row as PostTableRow[]} />
    default:
      return null
  }
}
