'use client'

import { HStack, VStack, Text, Box, Image } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import BlogShareLinks from '@/app/blog/components/blog-share-links'
import { MainLayout } from '@/components'
import { useBlogPost } from '@/hooks/use-blog-articles'
import { createPostShareUrls } from '@/services'
import { headingLarge, paragraphRegular } from '@/styles/fonts/fonts.styles'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  console.log(params)
  const { data } = useBlogPost(params.slug)

  const avatarUrl = `${process.env.NEXT_PUBLIC_BLOG_URL}${data?.data[0].author.avatar.url}`

  console.log(avatarUrl)

  return (
    <MainLayout>
      <HStack
        w='full'
        gap={0}
        justifyContent='space-between'
        alignItems='flex-start'
        marginTop={isMobile ? '36px' : '80px'}
      >
        <VStack gap='24px' maxW='800px' alignItems='flex-start'>
          <Text {...headingLarge}>{data?.data[0].title}</Text>
          <Text {...paragraphRegular} color='grey.700' maxW='640px'>
            {data?.data[0].description}
          </Text>
        </VStack>
        <BlogShareLinks slug={params.slug} />
      </HStack>
      <Box my={isMobile ? '12px' : '56px'}>
        <Image
          src={`${process.env.NEXT_PUBLIC_BLOG_URL}${data?.data[0].cover.url}`}
          alt='post-image'
          h={isMobile ? '216px' : '720px'}
          objectFit='cover'
          borderRadius='12px'
        />
      </Box>
      <HStack mb={isMobile ? '12px' : '56px'}>
        <Avatar account='' avatarUrl={avatarUrl || ''} size='24px' />
      </HStack>
    </MainLayout>
  )
}
