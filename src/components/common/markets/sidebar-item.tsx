import { Link, Text, HStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import GrinIcon from '@/resources/icons/grid-icon.svg'
import DashboardIcon from '@/resources/icons/sidebar/dashboard.svg'
import { useCategories } from '@/services'
import { useMarkets } from '@/services/MarketsService'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

export interface SideItemProps {
  isActive?: boolean
  icon?: ReactNode | null
  children: ReactNode
  color?: string
  onClick: () => void
}

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
  const { selectedCategory, handleCategory, handleDashboard, dashboard } = useTokenFilter()
  const searchParams = useSearchParams()

  const { data: categories } = useCategories()
  const { data } = useMarkets(null)

  const markets: Market[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages])

  const marketsByCategory = useMemo(() => {
    if (!markets.length || !categories?.length) return {}

    const counts: Record<string, number> = {}
    categories.forEach((category) => {
      counts[category.name] = 0
    })

    const otherCategory = categories.find((cat) => cat.name.toLowerCase() === 'other')
    const otherCategoryName = otherCategory?.name || 'Other'

    markets.forEach((market) => {
      if (market.categories && market.categories.length > 0) {
        market.categories.forEach((categoryName) => {
          counts[categoryName] = (counts[categoryName] || 0) + 1
        })
      } else {
        counts[otherCategoryName] = (counts[otherCategoryName] || 0) + 1
      }
    })

    return counts
  }, [markets, categories])

  const createQueryString = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', categoryName.toLowerCase())

    if (params.has('dashboard')) {
      params.delete('dashboard')
    }

    return params.toString()
  }

  const categoriesWithMarkets = useMemo(() => {
    return (
      categories?.filter(
        (category) => marketsByCategory[category.name] && marketsByCategory[category.name] > 0
      ) || []
    )
  }, [categories, marketsByCategory])

  return (
    <>
      <NextLink href={'/'}>
        <Link variant='transparent' px={0} minW='122px'>
          <HStack
            gap='4px'
            cursor='pointer'
            bg={!selectedCategory ? 'grey.100' : 'unset'}
            onClick={() => {
              handleCategory(undefined)
              handleDashboard(undefined)
            }}
            px={'8px'}
            rounded='8px'
          >
            <GrinIcon width={16} height={16} />
            <Text {...paragraphRegular}>All Markets</Text>
          </HStack>
        </Link>
      </NextLink>
      {isMobile && (
        <NextLink
          href={`/?dashboard=marketcrash`}
          passHref
          style={{ width: isMobile ? 'fit-content' : '100%' }}
        >
          <Link variant='transparent' px={0}>
            <SideItem
              isActive={dashboard === 'marketcrash'}
              icon={<DashboardIcon width={16} height={16} />}
              onClick={() => {
                handleDashboard('marketcrash')
              }}
              color='orange-500'
            >
              Market crash
            </SideItem>
          </Link>
        </NextLink>
      )}
      {categoriesWithMarkets.map((category) => (
        <NextLink key={category.id} href={`/?${createQueryString(category.name)}`}>
          <Link variant='transparent' px={0}>
            <SideItem
              isActive={selectedCategory?.name.toLowerCase() === category.name.toLowerCase()}
              onClick={() => {
                handleCategory({
                  id: category.id,
                  name: category.name,
                })
                handleDashboard(undefined)
              }}
            >
              {category.name} ({marketsByCategory[category.name]})
            </SideItem>
          </Link>
        </NextLink>
      ))}
    </>
  )
}
