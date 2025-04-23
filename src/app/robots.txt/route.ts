import { NextResponse } from 'next/server'

export function GET() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'https://limitless.exchange'
  const content = `
User-agent: *
Allow: /

Sitemap: ${url}/sitemap.xlm
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
