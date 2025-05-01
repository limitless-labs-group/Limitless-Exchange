import { geolocation } from '@vercel/functions'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: '/:path*', // This matches all routes
}

export async function middleware(req: NextRequest) {
  const { country } = geolocation(req)

  const response = NextResponse.next()

  if (country === 'US') {
    response.cookies.set('limitless_geo', btoa(country), {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
    })
  } else {
    response.cookies.delete('limitless_geo')
  }

  const url = new URL(req.url)
  const searchParams = url.searchParams
  const referralCode = searchParams.get('r')

  if (referralCode) {
    response.headers.set('x-referral', referralCode)
  }
  response.headers.set('x-url', req.url)

  return response
}
