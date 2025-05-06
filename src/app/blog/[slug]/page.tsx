'use client'

import { MainLayout } from '@/components'
import { useBlogPost } from '@/hooks/use-blog-articles'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  console.log(params)
  const { data } = useBlogPost(params.slug)
  return <MainLayout>post</MainLayout>
}
