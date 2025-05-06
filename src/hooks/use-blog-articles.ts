import { useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { BlogPostsResponse } from '@/types/blog'

export function useBlogArticles() {
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      const response: AxiosResponse<BlogPostsResponse> = await axios.get(
        `${process.env.NEXT_PUBLIC_BLOG_URL}/api/articles?populate[author][populate]=avatar&populate[tag]=*&populate[cover][populate]=related`
      )
      return response.data
    },
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const response: AxiosResponse<BlogPostsResponse> = await axios.get(
        `${process.env.NEXT_PUBLIC_BLOG_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`
      )
      return response.data
    },
  })
}
