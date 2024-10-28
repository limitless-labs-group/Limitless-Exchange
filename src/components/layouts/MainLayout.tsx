import { Box, Flex, FlexProps, HStack, Spinner } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import MarketPage from '@/components/common/markets/market-page'
import HeaderMarquee from '@/components/layouts/header-marquee'
import MobileHeader from '@/components/layouts/mobile-header'
import MobileNavigation from '@/components/layouts/mobile-navigation'
import Sidebar from '@/components/layouts/sidebar'
import { useTradingService } from '@/services'

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
  const { marketPageOpened } = useTradingService()
  return (
    <Box
      id='main'
      flexDir={'column'}
      w={'full'}
      minH={'100vh'}
      margin={'0 auto'}
      // overflow={'hidden'}
      alignItems={'center'}
      justifyContent={'space-between'}
      gap={{ sm: 6, md: 10 }}
      bg='grey.100'
      {...props}
    >
      <HeaderMarquee />
      <Box mt='20px' mb={isMobile ? '60px' : 0}>
        {isMobile && <MobileHeader />}
        <HStack minH={'calc(100vh - 20px)'} alignItems='flex-start'>
          {!isMobile && <Sidebar />}
          {isLoading ? (
            <Flex w={'full'} h={'80vh'} alignItems={'center'} justifyContent={'center'}>
              <Spinner />
            </Flex>
          ) : (
            <Box ml={isMobile ? 0 : '200px'} p={layoutPadding} w='full'>
              {children}
            </Box>
          )}
        </HStack>
      </Box>
      {isMobile && <MobileNavigation />}
      {marketPageOpened && <MarketPage />}
    </Box>
  )
}
