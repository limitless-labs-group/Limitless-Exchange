import { HStack, Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { isDesktop, isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import Orderbook from '@/app/(markets)/markets/[address]/components/clob/orderbook'
import { PriceChartContainer } from '@/app/(markets)/markets/[address]/components/price-chart-container'
import LineChartIcon from '@/resources/icons/line-chart-icon.svg'
import OrderbookIcon from '@/resources/icons/orderbook.svg'
import { ChangeEvent, useAmplitude, useTradingService } from '@/services'

export default function ClobTabs() {
  const { market } = useTradingService()
  const [isSmallLaptop, setIsSmallLaptop] = useState(false)
  const { trackChanged } = useAmplitude()

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
      title: 'Chart',
      icon: <LineChartIcon width={16} height={16} />,
    },
    {
      title: 'Order Book',
      icon: <OrderbookIcon width='16px' height='16px' />,
    },
  ]

  const tabPanels = useMemo(() => {
    return [
      <PriceChartContainer
        key={uuidv4()}
        slug={market?.slug}
        marketType='single'
        tradeType={market?.tradeType}
      />,
      <Orderbook key={uuidv4()} variant={isSmallLaptop ? 'small' : 'large'} />,
    ]
  }, [market?.slug, isSmallLaptop])

  const handleTabChanged = (event: string) => {
    trackChanged(ChangeEvent.ChartTabChanged, {
      view: event + 'on',
      marketMarketType: market?.tradeType === 'amm' ? 'AMM' : 'CLOB',
      marketAddress: market?.slug,
    })
  }

  return (
    <Tabs position='relative' variant='common' mb='24px'>
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.title} onClick={() => handleTabChanged(tab.title)}>
            <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
              {tab.icon}
              <>{tab.title}</>
            </HStack>
          </Tab>
        ))}
      </TabList>
      <TabIndicator mt='-2px' height='2px' bg='grey.800' transitionDuration='200ms !important' />
      <TabPanels>
        {tabPanels.map((panel, index) => (
          <TabPanel key={index} mt='16px'>
            {panel}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  )
}
