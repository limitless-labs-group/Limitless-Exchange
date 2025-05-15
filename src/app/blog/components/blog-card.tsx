import { VStack, Image, HStack, Text, Box, Grid } from '@chakra-ui/react'
import Link from 'next/link'
import { isMobile } from 'react-device-detect'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import { h3Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { BlogPost } from '@/types/blog'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Grid>
      <Link href={`/blog/${post.slug}`}>
        <VStack w='full' gap='12px' alignItems='flex-start' cursor='pointer'>
          <Image
            src={`${process.env.NEXT_PUBLIC_BLOG_URL}/assets/${post.image}`}
            alt='post-image'
            h='386px'
            width='full'
            objectFit='cover'
            borderRadius='12px'
          />
          <HStack gap='8px'>
            <Text {...paragraphRegular} color='grey.500'>
              {post.author.first_name} {post.author.last_name}
            </Text>
            <Box transform='rotate(270deg)' color='grey.500'>
              <ChevronDownIcon height={16} width={16} />
            </Box>
            {/*{post.tag.map((tag) => (*/}
            {/*  <Text {...paragraphRegular} color='grey.500' key={tag.tags}>*/}
            {/*    #{tag.tags}*/}
            {/*  </Text>*/}
            {/*))}*/}
          </HStack>
          <Text {...h3Bold} w={isMobile ? 'full' : '80%'}>
            {post.title}
          </Text>
          <Text {...paragraphRegular} color='grey.700' w={isMobile ? 'full' : '80%'}>
            {post.title}
          </Text>
        </VStack>
      </Link>
    </Grid>
  )
}
