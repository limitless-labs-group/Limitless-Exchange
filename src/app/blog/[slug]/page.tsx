import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import BlogPostPage from '@/app/blog/[slug]/blog-post-page'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['blog-post', params.slug],
  })
  const dehydratedState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydratedState}>
      <BlogPostPage slug={params.slug} />
    </HydrationBoundary>
  )
}
