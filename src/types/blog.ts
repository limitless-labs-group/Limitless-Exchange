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

export enum BlogSectionType {
  ARTICLE_TITLE = 'shared.article-title',
  SECTION_TEXT = 'shared.section-text',
  SECTION_DIVIDER = 'shared.divider',
  SECTION_MEDIA = 'shared.media',
  QUOTE = 'shared.quote',
  MARKET_SECTION = 'shared.market-section',
  SECTION_SUBTITLE = 'shared.section-subtitle',
  UNNUMBERED_LIST = 'shared.unnumbered-list',
  NUMBERED_LIST = 'shared.numbered-list',
  TABLE = 'shared.table',
  HIGHLIGHTED_TEXT = 'shared.highlighted-text',
  SUMMARY = 'shared.article-sumarry',
}

export interface BlogSection {
  id: number
  __component: BlogSectionType
  [key: string]: unknown
}

export interface BlogPostFile {
  id: number
  documentId: string
  name: string
  alternativeText: null | string
  caption: null | string
  width: number
  height: number
  formats: {
    small: BlogPostImageOption
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
}

export interface BlogPost {
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
  tag: {
    id: number
    tags: string | null
  }[]
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
  blocks: BlogSection[]
}

export interface BlogPostsResponse {
  data: BlogPost[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface PostMarketSlug {
  id: number
  value: string
}

export interface PostSummaryText {
  id: number
  value: string
}

export interface PostValue {
  id: number
  value: string
}

export interface PostTableRow {
  id: number
  value: PostValue[]
}

export interface PostTable {
  Header: PostValue[]
  row: PostTableRow[]
}
