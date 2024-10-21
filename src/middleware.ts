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

  return response
}
