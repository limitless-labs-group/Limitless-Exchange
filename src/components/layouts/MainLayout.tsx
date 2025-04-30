import { Box, Flex, FlexProps, HStack, Spinner } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { isMobile } from 'react-device-detect'
import MarketPage from '@/components/common/markets/market-page'
import { CategoryItems } from '@/components/common/markets/sidebar-item'
import Header from '@/components/layouts/header'
import MobileHeader from '@/components/layouts/mobile-header'
import MobileNavigation from '@/components/layouts/mobile-navigation'
import usePageName from '@/hooks/use-page-name'
import { useTradingService } from '@/services'
import { inter } from '@/styles'

interface IMainLayout extends FlexProps {
  isLoading?: boolean
  layoutPadding?: string
}

export const MainLayout = ({
  children,
  isLoading,
  layoutPadding = '16px',
  ...props
}: IMainLayout) => {
  const pathname = usePathname()
  const { marketPageOpened, market } = useTradingService()
  const pageName = usePageName()

  const getPaddingByPage = (page: string): { desktop: string; mobile: string } => {
    switch (page) {
      case 'Explore Markets':
        return { desktop: '96px', mobile: '65px' }
      case 'Draft':
        return { desktop: '0px', mobile: '0px' }
      default:
        return { desktop: '64px', mobile: '78px' }
    }
  }

  const { desktop: desktopPadding, mobile: mobilePadding } = getPaddingByPage(pageName)

  return (
    <Box
      className={inter.className}
      id='main'
      flexDir={'column'}
      w={'full'}
      minH={'100vh'}
      margin={'0 auto'}
      alignItems={'center'}
      justifyContent={'space-between'}
      gap={{ sm: 6, md: 10 }}
      {...props}
    >
      {isMobile ? <MobileHeader /> : <Header />}
      <Box
        mb={isMobile ? '60px' : 0}
        overflow='hidden'
        mt={isMobile ? mobilePadding : desktopPadding}
      >
        {isMobile && pageName === 'Explore Markets' && (
          <HStack py='4px' px='12px' bg='grey.50' maxW='100%' overflowX='auto'>
            <CategoryItems />
          </HStack>
        )}
        <HStack minH={'100vh'} alignItems='flex-start'>
          {isLoading ? (
            <Flex w={'full'} h={'80vh'} alignItems={'center'} justifyContent={'center'}>
              <Spinner />
            </Flex>
          ) : (
            <Flex ml={isMobile ? 0 : '0'} p={layoutPadding} w='full' justifyContent='center'>
              {children}
            </Flex>
          )}
        </HStack>
      </Box>
      {isMobile && <MobileNavigation />}
      {marketPageOpened && pathname !== `/markets/${market?.slug}` && <MarketPage />}
    </Box>
  )
}
