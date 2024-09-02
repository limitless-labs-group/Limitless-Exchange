import { usePathname } from 'next/navigation'

function usePageName() {
  const pathname = usePathname()

  const getPageName = (path: string): PageName => {
    switch (path) {
      case '/':
        return 'Home'
      case '/markets':
        return 'Explore Markets'
      case '/portfolio':
        return 'Portfolio'
      default:
        if (path.startsWith('/markets/')) {
          return 'Market Page'
        }
        return 'Unknown Page' // Fallback for unknown paths
    }
  }

  return getPageName(pathname)
}

export type PageName = 'Explore Markets' | 'Portfolio' | 'Market Page' | 'Unknown Page' | 'Home'

export default usePageName
