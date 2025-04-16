'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export const CanonicalLink = () => {
  const pathname = usePathname()
  const [canonicalUrl, setCanonicalUrl] = useState('')

  useEffect(() => {
    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}`

    if (pathname === '/') {
      setCanonicalUrl(baseUrl)
    } else {
      const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      setCanonicalUrl(`${normalizedBaseUrl}${normalizedPathname}`)
    }
  }, [pathname])

  if (!canonicalUrl) return null

  return <link rel='canonical' href={canonicalUrl} />
}
