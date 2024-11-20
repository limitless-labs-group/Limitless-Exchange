import { geolocation } from '@vercel/functions'
import axios from 'axios'
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

  if (pathname.startsWith('/draft')) {
    try {
      await axios.get(`${baseUrl}/auth/verify-auth`)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return NextResponse.redirect(home ?? '')
      }
    }
  }

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
