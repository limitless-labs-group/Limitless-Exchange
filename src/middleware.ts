import { geolocation } from '@vercel/functions'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: '/:path*', // This matches all routes
}

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL
const home = process.env.NEXT_PUBLIC_FRAME_URL

export async function middleware(req: NextRequest) {
  const { country } = geolocation(req)
  const { pathname } = req.nextUrl

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

  if (!baseUrl || !home) {
    console.error('Missing required environment variables.')
    return response
  }

  if (pathname.startsWith('/draft')) {
    try {
      const authResponse = await fetch(`${baseUrl}/auth/verify-auth`, {
        method: 'GET',
      })

      if (!authResponse.ok && authResponse.status === 401) {
        return NextResponse.redirect(home)
      }
    } catch (error) {
      console.error('Error verifying auth:', error)
    }
  }
  return response
}
