import { HStack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { isDesktop, isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import ClobOrdersTab from '@/app/(markets)/markets/[address]/components/clob/clob-orders-tab'
import Orderbook from '@/app/(markets)/markets/[address]/components/clob/orderbook'
import { MarketPriceChart } from '@/app/(markets)/markets/[address]/components/market-price-chart'
import PortfolioMarketGroup from '@/app/(markets)/markets/[address]/components/portfolio-market-group'
import CandlestickIcon from '@/resources/icons/candlestick-icon.svg'
import OrderbookIcon from '@/resources/icons/orderbook.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import SandClockIcon from '@/resources/icons/sand-clock.svg'

interface GroupMarketSectionTabsProps {
  mobileView?: boolean
}

export default function GroupMarketSectionTabs({
  mobileView = false,
}: GroupMarketSectionTabsProps) {
  const [isSmallLaptop, setIsSmallLaptop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth

      if (isDesktop && width >= 1024 && width <= 1366) {
        setIsSmallLaptop(true)
      } else {
        setIsSmallLaptop(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const tabs = [
    {
      title: 'Orderbook',
      icon: <OrderbookIcon width='16px' height='16px' />,
    },
    {
      title: 'Chart',
      icon: <CandlestickIcon width={16} height={16} />,
    },
    {
      title: isMobile ? 'Orders' : 'Open Orders',
      icon: <SandClockIcon width={16} height={16} />,
    },
    {
      title: 'Portfolio',
      icon: <PortfolioIcon width='16px' height='16px' />,
    },
  ]

  const tabPanels = [
    <Orderbook key={uuidv4()} variant={isSmallLaptop || mobileView ? 'small' : 'large'} />,
    <MarketPriceChart key={uuidv4()} />,
    <ClobOrdersTab key={uuidv4()} />,
    <PortfolioMarketGroup key={uuidv4()} />,
  ]

  const handleTabChanged = (event: string) => {
    // trackChanged(ChangeEvent.ChartTabChanged, {
    //   view: event + 'on',
    //   marketMarketType: market?.tradeType === 'amm' ? 'AMM' : 'CLOB',
    //   marketAddress: market?.slug,
    // })
  }

  return (
    <>
      <Tabs position='relative' variant='common'>
        <TabList maxW='100%' overflowX='auto'>
          {tabs.map((tab) => (
            <Tab key={tab.title} onClick={() => handleTabChanged(tab.title)}>
              <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                {tab.icon}
                <>{tab.title}</>
              </HStack>
            </Tab>
          ))}
        </TabList>
        {/*<TabIndicator mt='-2px' height='2px' bg='grey.800' transitionDuration='200ms !important' />*/}
        <TabPanels>
          {tabPanels.map((panel, index) => (
            <TabPanel key={index} mt='16px'>
              {panel}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </>
  )
}
