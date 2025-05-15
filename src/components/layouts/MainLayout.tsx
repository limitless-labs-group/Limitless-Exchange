import { Box, FlexProps } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { isMobile } from 'react-device-detect'
import MarketPage from '@/components/common/markets/market-page'
import DesktopFooter from '@/components/layouts/desktop-footer'
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

  const headerHeight = isMobile ? 64 : 48
  const footerHeight = isMobile ? 60 : 0

  const reservedHeight = headerHeight + (headerComponent ? 48 : 0) + footerHeight
  const contentHeight = `calc(100vh - ${reservedHeight}px)`

  return (
    <Box
      className={inter.className}
      id='main'
      w='full'
      minH='100vh'
      display='flex'
      flexDirection='column'
      {...props}
    >
      {isMobile ? <MobileHeader /> : <Header />}

      {headerComponent && (
        <Box
          position='fixed'
          top={`${headerHeight}px`}
          bg='grey.50'
          zIndex={2000}
          w='full'
          h='48px'
        >
          {headerComponent}
        </Box>
      )}

      <Box
        mt={`${headerHeight + (headerComponent ? 48 : 0)}px`}
        mb={isMobile ? `100px` : '0'}
        flex='1'
        overflow='hidden'
        height={contentHeight}
        display='flex'
        flexDirection='column'
      >
        <Box
          p={layoutPadding}
          maxW='1420px'
          m='auto'
          w='100%'
          flex='1'
          display='flex'
          flexDirection='column'
        >
          {children}
        </Box>
      </Box>

      {!isMobile && <DesktopFooter />}
      {isMobile && <MobileNavigation />}
      {marketPageOpened && pathname !== `/markets/${market?.slug}` && <MarketPage />}
    </Box>
  )
}
