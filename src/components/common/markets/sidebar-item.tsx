import { Link, Text, HStack } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React, { ReactNode, useMemo } from 'react'
import { useCategoriesWithCounts } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
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
  const pathname = usePathname()

  const { data: categoriesWithCount } = useCategoriesWithCounts()

  const categoriesWithMarkets = useMemo(() => {
    return categoriesWithCount?.categories?.filter((category) => category.count > 0) || []
  }, [categoriesWithCount])

  if (!categoriesWithCount?.categories?.length) {
    return null
  }

  return (
    <>
      {categoriesWithMarkets.map((category) => {
        const categoryPath = `/cat/${category.name.toLowerCase().replace(/\s+/g, '-')}`
        const isActive = pathname === categoryPath

        return (
          <ReferralLink key={category.id} href={categoryPath}>
            <Link variant='transparent' px={0}>
              <SideItem isActive={isActive}>
                {category.name} ({category.count})
              </SideItem>
            </Link>
          </ReferralLink>
        )
      })}
    </>
  )
}
