import { Text, HStack } from '@chakra-ui/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import Crypto from '@/resources/icons/sidebar/crypto.svg'
import Finance from '@/resources/icons/sidebar/finance.svg'
import Others from '@/resources/icons/sidebar/others.svg'
import Sport from '@/resources/icons/sidebar/sport.svg'
import Weather from '@/resources/icons/sidebar/weather.svg'
import { useMarkets } from '@/services/MarketsService'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup } from '@/types'

export interface SideItemProps {
  isActive?: boolean
  icon: ReactNode
  children: ReactNode
  onClick: () => void
}

//ids and names come from api /categories
export const MARKET_CATEGORIES = {
  CRYPTO: { id: 2, name: 'Crypto', description: '', icon: <Crypto width={16} height={16} /> },
  FINANCICALS: {
    id: 8,
    name: 'Financials',
    description: '',
    icon: <Finance width={16} height={16} />,
  },
  WEATHER: { id: 9, name: 'Weather', description: '', icon: <Weather width={16} height={16} /> },
  SPORTS: { id: 1, name: 'Sports', description: '', icon: <Sport width={16} height={16} /> },
  OTHER: { id: 5, name: 'Other', description: '', icon: <Others width={16} height={16} /> },
} as const

export type MarketCategory = (typeof MARKET_CATEGORIES)[keyof typeof MARKET_CATEGORIES]

export const categories = Object.values(MARKET_CATEGORIES)

export const SideItem = ({ isActive, onClick, icon, children }: SideItemProps) => {
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
      {React.cloneElement(icon as React.ReactElement, {
        style: {
          color: isActive ? 'var(--chakra-colors-grey-600)' : 'var(--chakra-colors-grey-500)',
        },
      })}
      <Text {...paragraphMedium} fontWeight={500} color={isActive ? 'grey.600' : 'grey.500'}>
        {children}
      </Text>
    </HStack>
  )
}

export const CategoryItems = () => {
  const { selectedCategory, handleCategory } = useTokenFilter()
  const searchParams = useSearchParams()

  const { data } = useMarkets(null)

  const markets: (Market | MarketGroup)[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages])

  const marketsByCategory = useMemo(() => {
    if (!markets.length) return {}

    const counts = markets.reduce((acc, market) => {
      const categoryName =
        typeof market.category === 'string' ? market.category : market.category.name
      acc[categoryName] = (acc[categoryName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return counts
  }, [markets])

  const createQueryString = () => {
    const params = new URLSearchParams(searchParams.toString())
    return params.toString()
  }

  const categoriesWithMarkets = useMemo(() => {
    return categories.filter(
      (category) => marketsByCategory[category.name] && marketsByCategory[category.name] > 0
    )
  }, [marketsByCategory])

  return categoriesWithMarkets.map((c) => {
    return (
      <Link
        key={c.name}
        href={`/?${createQueryString()}`}
        style={{ width: isMobile ? 'fit-content' : '100%' }}
      >
        <SideItem
          isActive={selectedCategory?.name === c.name}
          icon={c.icon}
          onClick={() => {
            handleCategory({
              id: c.id,
              name: c.name,
            })
          }}
        >
          {c.name} ({marketsByCategory[c.name]})
        </SideItem>
      </Link>
    )
  })
}
