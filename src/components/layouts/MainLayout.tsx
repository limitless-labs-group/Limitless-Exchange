import { Box, FlexProps } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { isMobile } from 'react-device-detect'
import MarketPage from '@/components/common/markets/market-page'
import Header from '@/components/layouts/header'
import MobileHeader from '@/components/layouts/mobile-header'
import MobileNavigation from '@/components/layouts/mobile-navigation'
import { useTradingService } from '@/services'
import { inter } from '@/styles'

interface IMainLayout extends FlexProps {
  layoutPadding?: string
  headerComponent?: JSX.Element
}

export const MainLayout = ({
  children,
  headerComponent,
  layoutPadding = '16px',
  ...props
}: IMainLayout) => {
  const pathname = usePathname()
  const { marketPageOpened, market } = useTradingService()

  return (
    <Box
      className={inter.className}
      id='main'
      w={'full'}
      minH={'100vh'}
      margin={'0 auto'}
      gap={{ sm: 6, md: 10 }}
      {...props}
    >
      {isMobile ? <MobileHeader /> : <Header />}
      <Box mb={isMobile ? '60px' : 0} overflow='hidden' mt={isMobile ? '64px' : '48px'}>
        <Box minH={'100vh'}>
          {headerComponent}
          <Box p={layoutPadding} maxW='1420px' m='auto'>
            {children}
          </Box>
        </Box>
      </Box>
      {isMobile && <MobileNavigation />}
      {marketPageOpened && pathname !== `/markets/${market?.slug}` && <MarketPage />}
    </Box>
  )
}
