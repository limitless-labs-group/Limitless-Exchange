import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'https://limitless.exchange'
  const pages = [`${url}/sitemap-general.xml`, `${url}/sitemap-markets.xml`]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map(
          (page) => `
            <sitemap>
              <loc>${page}</loc>
            </sitemap>`
        )
        .join('')}
    </sitemapindex>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
