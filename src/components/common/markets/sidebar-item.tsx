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
}

export const SideItem = ({ isActive, icon, children, color }: SideItemProps) => {
  return (
    <HStack
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
  const { selectedCategory } = useTokenFilter()

  const { data: categoriesWithCount } = useCategoriesWithCounts()

  const categoriesWithMarkets = useMemo(() => {
    return categoriesWithCount?.categories?.filter((category) => category.count > 0) || []
  }, [categoriesWithCount])

  if (!categoriesWithCount?.categories?.length) {
    return null
  }

  return (
    <>
      <ReferralLink href={`/`}>
        <Link variant='transparent' px={0}>
          <SideItem>{`All markets (${categoriesWithCount.totalCount})`}</SideItem>
        </Link>
      </ReferralLink>
      {categoriesWithMarkets.map((category) => (
        <ReferralLink
          key={category.id}
          href={`/cat/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Link variant='transparent' px={0}>
            <SideItem
              isActive={selectedCategory?.name.toLowerCase() === category.name.toLowerCase()}
            >
              {category.name} ({category.count})
            </SideItem>
          </Link>
        </ReferralLink>
      ))}
    </>
  )
}
