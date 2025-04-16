'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export const CanonicalLink = () => {
  const pathname = usePathname()
  const [canonicalUrl, setCanonicalUrl] = useState('')

  useEffect(() => {
    const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}`

    setCanonicalUrl(`${baseUrl}${pathname}`)
  }, [pathname])

  if (!canonicalUrl) return null

  return <link rel='canonical' href={canonicalUrl} />
}
