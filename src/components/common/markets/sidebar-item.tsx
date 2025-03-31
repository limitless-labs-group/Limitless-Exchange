import { Link, Text, HStack } from '@chakra-ui/react'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import GrinIcon from '@/resources/icons/grid-icon.svg'
import DashboardIcon from '@/resources/icons/sidebar/dashboard.svg'
import { useCategoriesWithCounts } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { ReferralLink } from '../referral-link'

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

  const { data: categoriesWithCount } = useCategoriesWithCounts()

  const createQueryString = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', categoryName.toLowerCase())

    if (params.has('dashboard')) {
      params.delete('dashboard')
    }

    return params.toString()
  }

  const categoriesWithMarkets = useMemo(() => {
    return categoriesWithCount?.categories?.filter((category) => category.count > 0) || []
  }, [categoriesWithCount])

  if (!categoriesWithCount?.categories?.length) {
    return null
  }

  return (
    <>
      <ReferralLink href={'/'}>
        <Link variant='transparent' px={0} minW='122px'>
          <HStack
            gap='4px'
            cursor='pointer'
            bg={!selectedCategory && !dashboard ? 'grey.100' : 'unset'}
            onClick={() => {
              handleCategory(undefined)
              handleDashboard(undefined)
            }}
            px={'8px'}
            rounded='8px'
          >
            <GrinIcon width={16} height={16} />
            <Text {...paragraphRegular} whiteSpace='nowrap'>{`All Markets ${
              categoriesWithCount.totalCount ? '(' + categoriesWithCount.totalCount + ')' : ''
            }`}</Text>
          </HStack>
        </Link>
      </ReferralLink>
      {isMobile && (
        <ReferralLink
          href={`/market-crash`}
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
        </ReferralLink>
      )}
      {categoriesWithMarkets.map((category) => (
        <ReferralLink key={category.id} href={`/?${createQueryString(category.name)}`}>
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
              {category.name} ({category.count})
            </SideItem>
          </Link>
        </ReferralLink>
      ))}
    </>
  )
}
