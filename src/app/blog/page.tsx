'use client'

import { Grid, VStack } from '@chakra-ui/react'
import React from 'react'
import Skeleton from '@/components/common/skeleton'
import BlogCard from '@/app/blog/components/blog-card'
import { MainLayout } from '@/components'
import { useBlogArticles } from '@/hooks/use-blog-articles'

const BlogPostSkeleton = () => {
  return (
    <VStack w='full' flex={1} gap='12px'>
      <Skeleton height={386} />
      <Skeleton height={24} />
      <Skeleton height={48} />
      <Skeleton height={40} />
    </VStack>
  )
}

export default function BlogPage() {
  const { data, isLoading } = useBlogArticles()

  return (
    <MainLayout>
      <Grid templateColumns='repeat(auto-fit, minmax(200px, 1fr))' gap={8}>
        {isLoading
          ? [...Array(2)].map((index) => <BlogPostSkeleton key={index} />)
          : data?.data.map((postShort) => <BlogCard key={postShort.id} post={postShort} />)}
      </Grid>
    </MainLayout>
  )
}
