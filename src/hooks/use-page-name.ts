import { usePathname } from 'next/navigation'

function usePageName() {
  const pathname = usePathname()

  const getPageName = (path: string): PageName => {
    switch (path) {
      case '/':
        return 'Explore Markets'
      case '/feed':
        return 'Feed'
      case '/portfolio':
        return 'Portfolio'
      case '/lumy':
        return 'Lumy'
      case '/leaderboard':
        return 'Leaderboard'
      case '/my-markets':
        return 'My Markets'
      case '/market-crash':
        return 'Market Crash Dashboard'
      default:
        if (path.startsWith('/markets/')) {
          return 'Market Page'
        }
        return 'Unknown Page' // Fallback for unknown paths
    }
  }

  return getPageName(pathname)
}

export type PageName =
  | 'Explore Markets'
  | 'Portfolio'
  | 'Market Page'
  | 'Unknown Page'
  | 'Home'
  | 'Feed'
  | 'Lumy'
  | 'Leaderboard'
  | 'Market Crash Dashboard'
  | 'My Markets'

export default usePageName
