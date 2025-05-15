import { Box, HStack, IconButton, Link, Text, useTheme } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { CategoryItems } from '@/components/common/markets/sidebar-item'
import { ReferralLink } from '@/components/common/referral-link'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import ChevronLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import ChevronRightIcon from '@/resources/icons/arrow-right-icon.svg'
import GrinIcon from '@/resources/icons/grid-icon.svg'
import { useCategoriesWithCounts } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export function ScrollableCategories() {
  const { data: categoriesWithCount } = useCategoriesWithCounts()
  const { handleCategory, handleDashboard } = useTokenFilter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showRightGradient, setShowRightGradient] = useState(true)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const theme = useTheme()
  const pathname = usePathname()

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current
      setShowRightGradient(scrollLeft + clientWidth < scrollWidth)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth)
      setShowLeftArrow(scrollLeft > 0)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categoriesWithCount])

  const handleScroll = () => {
    checkScroll()
  }

  const scrollToNext = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth - 100
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const scrollToPrevious = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth - 100
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const isMainPage = pathname === '/'

  return (
    <Box position='relative'>
      <HStack position='relative' gap={0}>
        <ReferralLink href={'/'}>
          <Link variant='transparent' px={0}>
            <HStack
              gap='4px'
              cursor='pointer'
              bg={isMainPage ? 'grey.100' : 'unset'}
              onClick={() => {
                handleCategory(undefined)
                handleDashboard(undefined)
              }}
              px={'8px'}
              rounded='8px'
            >
              <GrinIcon width={16} height={16} />
              <Text
                {...paragraphMedium}
                whiteSpace='nowrap'
                color={isMainPage ? 'grey.800' : 'grey.700'}
              >
                {`All Markets ${
                  categoriesWithCount?.totalCount ? '(' + categoriesWithCount.totalCount + ')' : ''
                }`}
              </Text>
            </HStack>
          </Link>
        </ReferralLink>

        <Box position='relative' maxW='calc(100vw - 182px)' overflowX='auto' mx='12px'>
          {showLeftArrow && (
            <IconButton
              aria-label='Scroll left'
              icon={<ChevronLeftIcon />}
              position='absolute'
              left={0}
              top='50%'
              transform='translateY(-50%)'
              zIndex={2}
              onClick={scrollToPrevious}
              h='16px'
              w='16px'
              minW='16px'
            />
          )}

          {showLeftArrow && (
            <Box
              position='absolute'
              left={0}
              top={0}
              bottom={0}
              width={isMobile ? '100px' : '180px'}
              pointerEvents='none'
              background={`linear-gradient(to left, rgba(249, 249, 249, 0), ${theme.colors.grey[50]})`}
              zIndex={1}
            />
          )}

          <HStack
            ref={scrollContainerRef}
            overflowX='auto'
            whiteSpace='nowrap'
            spacing={2}
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              '-ms-overflow-style': 'none',
            }}
            onScroll={handleScroll}
          >
            <CategoryItems />
          </HStack>

          {showRightGradient && (
            <Box
              position='absolute'
              right={0}
              top={0}
              bottom={0}
              width={isMobile ? '100px' : '180px'}
              pointerEvents='none'
              background={`linear-gradient(to right, rgba(249, 249, 249, 0), ${theme.colors.grey[50]})`}
              zIndex={1}
            />
          )}

          {showRightArrow && (
            <IconButton
              aria-label='Scroll right'
              icon={<ChevronRightIcon />}
              position='absolute'
              right={0}
              top='50%'
              transform='translateY(-50%)'
              zIndex={2}
              onClick={scrollToNext}
              h='16px'
              w='16px'
              minW='16px'
            />
          )}
        </Box>
      </HStack>
    </Box>
  )
}
