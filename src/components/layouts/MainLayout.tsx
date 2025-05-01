import { Box, FlexProps } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React, { useMemo } from 'react'
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

  const childrenMargin = useMemo(() => {
    const baseMargin = isMobile ? 64 : 48
    const headerMargin = isMobile ? 16 : 0
    if (headerComponent) {
      return baseMargin + headerMargin + 32
    }
    return baseMargin
  }, [headerComponent])

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
      {headerComponent && (
        <Box
          position='fixed'
          top={isMobile ? '64px' : '48px'}
          bg='grey.50'
          overflow='hidden'
          zIndex={2000}
          w='full'
        >
          {headerComponent}
        </Box>
      )}
      <Box mb={isMobile ? '60px' : 0} overflow='hidden' mt={`${childrenMargin}px`}>
        <Box minH={'100vh'}>
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
