import { Box, Flex, FlexProps, HStack, Spinner } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { isMobile } from 'react-device-detect'
import MarketPage from '@/components/common/markets/market-page'
import Header from '@/components/layouts/header'
import MobileNavigation from '@/components/layouts/mobile-navigation'
import Sidebar from '@/components/layouts/sidebar'
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
      <Header />
      <Box
        mt='20px'
        mb={isMobile ? '60px' : 0}
        pt={isMobile && pathname !== '/lumy' ? '88px' : 0}
        overflow='hidden'
      >
        <HStack minH={'calc(100vh - 20px)'} alignItems='flex-start'>
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
