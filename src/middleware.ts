import { NextRequest, NextResponse } from 'next/server'
import { geolocation } from '@vercel/functions'

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
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return response
}
