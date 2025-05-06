interface BlogPostImageOption {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  path: null | string
  size: number
  width: number
  height: number
  sizeInBytes: number
}

export interface BlogPostShort {
  id: number
  documentId: string
  title: string
  description: string
  slug: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  author: {
    id: number
    documentId: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    avatar: {
      id: number
      documentId: string
      name: string
      alternativeText: null | string
      caption: null | string
      width: number
      height: number
      formats: {
        thumbnail: {
          ext: string
          url: string
          hash: string
          mime: string
          name: string
          path: null | string
          size: number
          width: number
          height: number
          sizeInBytes: number
        }
      }
      hash: string
      ext: string
      mime: string
      size: number
      url: string
      previewUrl: null | string
      provider: string
      provider_metadata: null | string
      createdAt: string
      updatedAt: string
      publishedAt: string
    }
  }
  tag: [
    {
      id: 5
      tags: string | null
    },
    {
      id: 6
      tags: string | null
    }
  ]
  cover: {
    id: number
    documentId: string
    name: string
    alternativeText: null | string
    caption: null | string
    width: number
    height: number
    formats: {
      large: BlogPostImageOption
      small: BlogPostImageOption
      medium: BlogPostImageOption
      thumbnail: BlogPostImageOption
    }
    hash: string
    ext: string
    mime: string
    size: number
    url: string
    previewUrl: null | string
    provider: string
    provider_metadata: null | string
    createdAt: string
    updatedAt: string
    publishedAt: string
    related: [
      {
        __type: string
        id: number
        documentId: string
        title: string
        description: string
        slug: string
        createdAt: string
        updatedAt: string
        publishedAt: string
      }
    ]
  }
}

export interface BlogPostsResponse {
  data: BlogPostShort[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
