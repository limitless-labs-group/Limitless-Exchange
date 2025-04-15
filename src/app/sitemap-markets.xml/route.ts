import axios from 'axios'
import { NextResponse } from 'next/server'
import { LIMIT_PER_PAGE } from '@/constants/application'
import { Market } from '@/types'

interface MarketResponse {
  data: Market[]
}

interface SitemapPage {
  slug: string
  createdAt: string
  title: string
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'https://limitless.exchange'

  async function fetchInitialMarkets(): Promise<{ markets: MarketResponse }> {
    const { data: response } = await axios.get<MarketResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`,
      {
        params: {
          page: 1,
          limit: LIMIT_PER_PAGE,
        },
      }
    )

    return {
      markets: response,
    }
  }
  const res = await fetchInitialMarkets()
  const pages: SitemapPage[] = res.markets.data.map((market: Market) => {
    return { slug: market.slug, createdAt: market.createdAt, title: market.title }
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${pages
    .map(
      (page: SitemapPage) => `
      <url>
        <loc>${url}/markets/${page.slug}</loc>
          <news:news>
            <news:publication>
              <news:name>Limitless</news:name>
              <news:language>en</news:language>
            </news:publication>
            <news:publication_date>${page.createdAt}</news:publication_date>
            <news:title>${page.title}</news:title>
          </news:news>
      </url>`
    )
    .join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
