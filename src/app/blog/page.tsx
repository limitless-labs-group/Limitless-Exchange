import { dehydrate, QueryClient, HydrationBoundary } from '@tanstack/react-query'
import React from 'react'
import BlogPostsPage from '@/app/blog/components/blog-posts-page'

export default async function BlogPage() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['blog-articles'],
  })
  const dehydratedState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydratedState}>
      <BlogPostsPage />
    </HydrationBoundary>
  )
}
