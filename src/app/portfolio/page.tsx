'use client'

import { Box, Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { PortfolioHistory, PortfolioStats } from '@/app/portfolio/components'
import EverythingTab from '@/app/portfolio/components/everything-tab'
import { MainLayout } from '@/components'
import {
  ClickEvent,
  OpenEvent,
  PageOpenedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { h1Bold, h2Regular, headline } from '@/styles/fonts/fonts.styles'

export default function PortfolioPage() {
  const tabs = ['Everything', 'History']

  const { trackClicked, trackOpened } = useAmplitude()
  const { onCloseMarketPage } = useTradingService()

  const handleTabClicked = (tab: string) => {
    trackClicked(ClickEvent.PortfolioInvestmentsTabClicked, {
      value: tab,
      source: 'Portfolio',
    })
  }

  const tabsList = [
    <EverythingTab key='everything' />,
    // <PortfolioPositions key='positions' />,
    <PortfolioHistory key='history' />,
  ]

  const getGreeting = (): string => {
    const hour = new Date().getHours()

    if (hour >= 0 && hour < 6) {
      return 'Good Night 🌙'
    }
    if (hour >= 6 && hour < 12) {
      return 'Good Morning 🌞'
    }
    if (hour >= 12 && hour < 18) {
      return 'Good Afternoon 🌤'
    }
    return 'Good Evening 🌅'
  }

  useEffect(() => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Portfolio Page',
    })
  }, [])

  useEffect(() => {
    return () => {
      !isMobile && onCloseMarketPage()
    }
  }, [])

  return (
    <MainLayout layoutPadding={'0px'}>
      <Box maxWidth='1294px' w='full'>
        <Text {...headline}>Portfolio</Text>
        <Text {...h1Bold} mt='8px'>
          {getGreeting()},
        </Text>
        <Text {...h1Bold}>here is your today’s summary</Text>
        <PortfolioStats />
        {/*<RewardsChart />*/}
        <Box maxWidth='924px' w='full' mt='24px' mb='16px' mx='auto'>
          <Text {...h2Regular} mb='16px'>
            Investments
          </Text>
          <Tabs position='relative' variant='common' mb='24px'>
            <TabList>
              {tabs.map((tab) => (
                <Tab key={tab} onClick={() => handleTabClicked(tab)}>
                  {tab}
                </Tab>
              ))}
            </TabList>
            <TabIndicator
              mt='-2px'
              height='2px'
              bg='grey.800'
              transitionDuration='200ms !important'
            />
            <TabPanels>
              {tabsList.map((panel, index) => (
                <TabPanel key={index} mt='16px'>
                  {panel}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </MainLayout>
  )
}
