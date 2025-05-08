import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'https://limitless.exchange'
  const pages = [
    {
      loc: url,
      freq: 'always',
      prio: '1',
    },
    {
      loc: `${url}/feed`,
      freq: 'always',
      prio: '0.8',
    },
    {
      loc: `${url}/portfolio`,
      freq: 'always',
      prio: '0.8',
    },
    {
      loc: `${url}/leaderboard`,
      freq: 'always',
      prio: '0.8',
    },
    {
      loc: `${url}/market-watch`,
      freq: 'always',
      prio: '0.8',
    },
    {
      loc: `${url}/search`,
      freq: 'always',
      prio: '0.8',
    },
  ]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${pages
    .map(
      (page) => `
      <url>
        <loc>${page.loc}</loc>
        <changefreq>${page.freq}</changefreq>
        <priority>${page.prio}</priority>
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
