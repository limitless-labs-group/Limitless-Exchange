import { Link, Text, HStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useMarkets } from '@/services/MarketsService'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup } from '@/types'

export interface SideItemProps {
  isActive?: boolean
  icon?: ReactNode | null
  children: ReactNode
  color?: string
  onClick: () => void
}

//ids and names come from api /categories
export const MARKET_CATEGORIES = {
  DAILY: {
    id: 16,
    name: 'Daily',
    description: '',
    icon: null,
    bannerImage: '',
  },
  CRYPTO: {
    id: 2,
    name: 'Crypto',
    description: '',
    icon: null,
    bannerImage: '',
  },
  FINANCIALS: {
    id: 8,
    name: 'Financials',
    description: '',
    icon: null,
    bannerImage: '',
  },
  WEATHER: {
    id: 9,
    name: 'Weather',
    description: '',
    icon: null,
    bannerImage: '',
  },
  SPORTS: {
    id: 1,
    name: 'Sports',
    description: '',
    icon: null,
    bannerImage: '',
  },
  POP: {
    id: 10,
    name: 'Pop Culture',
    description: '',
    icon: null,
    bannerImage: '',
  },
  RECESSION: {
    id: 11,
    name: 'Recession',
    description: '',
    icon: null,
    bannerImage: '',
  },
  STOCKS: {
    id: 6,
    name: 'Stocks',
    description: '',
    icon: null,
    bannerImage: '',
  },
  GOLD: {
    id: 12,
    name: 'Gold',
    description: '',
    icon: null,
    bannerImage: '',
  },
  INFLATION: {
    id: 13,
    name: 'Inflation',
    description: '',
    icon: null,
    bannerImage: '',
  },
  TRADE_WARS: {
    id: 14,
    name: 'Trade Wars',
    description: '',
    icon: null,
    bannerImage: '',
  },
  FOREX: {
    id: 15,
    name: 'Forex',
    description: '',
    icon: null,
    bannerImage: '',
  },
  POLITICS: {
    id: 3,
    name: 'Politics',
    description: '',
    icon: null,
    bannerImage: '',
  },
  SOCIAL: {
    id: 4,
    name: 'Social',
    description: '',
    icon: null,
    bannerImage: '',
  },
  OTHER: {
    id: 5,
    name: 'Other',
    description: '',
    bannerImage: '',
  },
} as const

export type MarketCategory = (typeof MARKET_CATEGORIES)[keyof typeof MARKET_CATEGORIES]

export const categories = Object.values(MARKET_CATEGORIES)

export const SideItem = ({ isActive, onClick, icon, children, color }: SideItemProps) => {
  return (
    <HStack
      onClick={onClick}
      w='full'
      h='24px'
      rounded='8px'
      bg={isActive ? 'grey.100' : 'unset'}
      px={'8px'}
      cursor='pointer'
      whiteSpace='nowrap'
    >
      {icon
        ? React.cloneElement(icon as React.ReactElement, {
            style: {
              color: color
                ? `var(--chakra-colors-${color})`
                : isActive
                ? 'var(--chakra-colors-grey-800)'
                : 'var(--chakra-colors-grey-700)',
            },
          })
        : null}
      <Text {...paragraphMedium} fontWeight={500} color={isActive ? 'grey.800' : 'grey.700'}>
        {children}
      </Text>
    </HStack>
  )
}

export const CategoryItems = () => {
  const { selectedCategory, handleCategory, handleDashboard } = useTokenFilter()
  const searchParams = useSearchParams()

  const { data } = useMarkets(null)

  const markets: (Market | MarketGroup)[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages])

  const marketsByCategory = useMemo(() => {
    if (!markets.length) return {}

    const counts: Record<string, number> = {}
    categories.forEach((category) => {
      counts[category.name] = 0
    })

    markets.forEach((market) => {
      if (market.categories && market.categories.length > 0) {
        market.categories.forEach((categoryName) => {
          counts[categoryName] = (counts[categoryName] || 0) + 1
        })
      } else {
        counts[MARKET_CATEGORIES.OTHER.name] = (counts[MARKET_CATEGORIES.OTHER.name] || 0) + 1
      }
    })

    return counts
  }, [markets])

  const createQueryString = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', categoryName.toLowerCase())

    if (params.has('dashboard')) {
      params.delete('dashboard')
    }

    return params.toString()
  }

  const categoriesWithMarkets = useMemo(() => {
    return categories.filter(
      (category) => marketsByCategory[category.name] && marketsByCategory[category.name] > 0
    )
  }, [marketsByCategory])
  return (
    <>
      {categoriesWithMarkets.map((c) => (
        <NextLink
          key={c.name}
          href={`/?${createQueryString(c.name)}`}
          style={{ width: isMobile ? 'fit-content' : '100%' }}
        >
          <Link variant='transparent'>
            <SideItem
              isActive={selectedCategory?.name.toLowerCase() === c.name.toLowerCase()}
              // icon={c.icon}
              onClick={() => {
                handleCategory({
                  id: c.id,
                  name: c.name,
                })
                handleDashboard(undefined)
              }}
            >
              {c.name} ({marketsByCategory[c.name]})
            </SideItem>
          </Link>
        </NextLink>
      ))}
    </>
  )
}
