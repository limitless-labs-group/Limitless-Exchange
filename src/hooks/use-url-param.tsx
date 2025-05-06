import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export type UrlParams = Record<string, string | null>

export const getSearchParams = (): UrlParams => {
  if (typeof window === 'undefined') return {}
  return Object.fromEntries(new URLSearchParams(window.location.search).entries())
}

export const getParam = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get(key)
}

export const updateSearchParams = (
  params: UrlParams,
  options: { replace?: boolean; router?: any } = {}
) => {
  if (typeof window === 'undefined') return

  if (options.router) {
    const currentParams = new URLSearchParams(window.location.search)
    const currentPathname = window.location.pathname

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        currentParams.delete(key)
      } else {
        currentParams.set(key, value)
      }
    })

    const newQuery = currentParams.toString()

    if (options.replace) {
      options.router.replace(newQuery ? `${currentPathname}?${newQuery}` : currentPathname, {
        scroll: false,
      })
    } else {
      options.router.push(newQuery ? `${currentPathname}?${newQuery}` : currentPathname, {
        scroll: false,
      })
    }
    return
  }

  // Fallback to the old method if router is not provided
  const url = new URL(window.location.href)
  Object.entries(params).forEach(([key, value]) => {
    if (value === null) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, value)
    }
  })

  if (options.replace) {
    window.history.replaceState(null, '', url.toString())
  } else {
    window.history.pushState(null, '', url.toString())
  }
}

export const useUrlParams = () => {
  const searchParams = useSearchParams()
  const [params, setParams] = useState(getSearchParams())
  const router = useRouter()

  useEffect(() => {
    setParams(getSearchParams())
  }, [searchParams])

  const setParam = (key: string, value: string | null, replace = true) => {
    const newParams = { ...params, [key]: value }
    updateSearchParams(newParams, { replace })
    setParams(newParams)
  }

  const updateParams = (updates: Record<string, string | null>, replace = true) => {
    const newParams = { ...params, ...updates }

    Object.keys(updates).forEach((key) => {
      if (updates[key] === null) {
        delete newParams[key]
      }
    })

    updateSearchParams(updates, { replace, router })
    setParams(newParams)
  }

  const getParam = (key: string): string | undefined => {
    return params[key] || undefined
  }

  return { params, setParam, updateParams, getParam }
}
