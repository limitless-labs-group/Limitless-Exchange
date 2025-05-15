import { useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { BlogPostsResponse } from '@/types/blog'

async function getBlogArticles() {
  const response: AxiosResponse<BlogPostsResponse> = await axios.get(
    `${process.env.NEXT_PUBLIC_BLOG_URL}/items/posts?filter[status][_eq]=published&fields=*,author.*`
  )
  return response.data
}

async function getBlogPost(slug: string) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BLOG_URL}/items/posts?filter[slug][_eq]=${slug}&fields=*,author.*,cover.*,tag.*,blocks.*`
  )
  return response.data
}

export function useBlogArticles() {
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: getBlogArticles,
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-article', slug],
    queryFn: async () => getBlogPost(slug),
  })
}

// export function useBlogPost(slug: string) {
//   return useQuery({
//     queryKey: ['article', slug],
//     queryFn: async () => {
//       const response: AxiosResponse<BlogPostsResponse> = await axios.get(
//         `${process.env.NEXT_PUBLIC_BLOG_URL}/api/articles?filters[slug][$eq]=${slug}&populate[blocks][on][shared.table][populate][Header]=*&populate[blocks][on][shared.table][populate][row][populate][value]=*&populate[blocks][on][shared.quote][populate]=*&populate[blocks][on][shared.media][populate]=*&populate[blocks]=*&populate[author][populate]=avatar&populate[cover][populate]=related&populate[tag]=*&populate[blocks][on][shared.article-title][populate]=*&populate[blocks][on][shared.section-text][populate]=*&populate[blocks][on][shared.divider][populate]=*&populate[blocks][on][shared.market-section][populate]=*&populate[blocks][on][shared.section-subtitle][populate]=*&populate[blocks][on][shared.unnumbered-list][populate]=*&populate[blocks][on][shared.numbered-list][populate]=*&populate[blocks][on][shared.highlighted-text][populate]=*&populate[blocks][on][shared.article-sumarry][populate]=*`
//       )
//       return response.data
//     },
//   })
// }
