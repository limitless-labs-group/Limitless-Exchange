'use client'

import { HStack, VStack } from '@chakra-ui/react'
import BlogShareLinks from '@/app/blog/components/blog-share-links'
import { MainLayout } from '@/components'
import { useBlogPost } from '@/hooks/use-blog-articles'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  console.log(params)
  const { data } = useBlogPost(params.slug)
  return (
    <MainLayout>
      <HStack w='full' gap={0}>
        <VStack gap='24px'></VStack>
        <BlogShareLinks />
      </HStack>
    </MainLayout>
  )
}
