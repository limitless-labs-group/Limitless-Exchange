'use client'

import { HStack, Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { CreateMarket } from './components/create-market'
import { DraftMarketsQueue } from './components/queue'
import { RecentMarkets } from './components/recent'
import { MainLayout } from '@/components'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import LoadingIcon from '@/resources/icons/loader-icon.svg'
import PlusIcon from '@/resources/icons/plus-square-icon.svg'

const CreateOwnMarketPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const tab = searchParams.get('tab')
    switch (tab) {
      case 'queue':
        setActiveIndex(1)
        break
      case 'recent':
        setActiveIndex(2)
        break
      default:
        setActiveIndex(0)
    }
  }, [searchParams])

  const onTabChange = (index: number) => {
    setActiveIndex(index)
    const tabName = index === 1 ? 'queue' : index === 2 ? 'recent' : 'draft'
    router.push(`/draft?tab=${tabName}`)
  }

  const tabs = [
    {
      title: 'Draft',
      icon: <PlusIcon width={'16px'} height={'16px'} />,
    },
    {
      title: 'Queue',
      icon: <LoadingIcon width={16} height={16} />,
    },
    {
      title: 'Recent',
      icon: <CopyIcon width={16} height={16} />,
    },
  ]
  const tabPanels = [
    <CreateMarket key={uuidv4()} />,
    <DraftMarketsQueue key={uuidv4()} />,
    <RecentMarkets key={uuidv4()} />,
  ]

  return (
    <MainLayout>
      <Tabs position='relative' variant='common' index={activeIndex} onChange={onTabChange}>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.title}>
              <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                {tab.icon}
                <>{tab.title}</>
              </HStack>
            </Tab>
          ))}
        </TabList>
        <TabIndicator mt='-2px' height='2px' bg='grey.800' transitionDuration='200ms !important' />
        <TabPanels mt='30px'>
          {tabPanels.map((panel, index) => (
            <TabPanel key={index}>{panel}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
