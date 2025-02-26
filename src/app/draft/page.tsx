'use client'

import {
  HStack,
  Tab,
  Text,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { DraftMarketsQueueClob } from '@/app/draft/components/queue-clob'
import { CreateMarket } from './components/create-market'
import { DraftMarketsQueue } from './components/queue'
import { RecentMarkets } from './components/recent'
import { MainLayout } from '@/components'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import LoadingIcon from '@/resources/icons/loader-icon.svg'
import PlusIcon from '@/resources/icons/plus-square-icon.svg'

type Tab = {
  title: string
  icon: React.JSX.Element
  component: React.FC
  param: string
}

const useTabLogic = (tabs: Tab[]) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const tab = searchParams.get('tab')
    const index = tabs.findIndex((t) => t.param === tab)
    setActiveIndex(index !== -1 ? index : 0)
  }, [searchParams])

  const onTabChange = (index: number) => {
    setActiveIndex(index)
    router.push(`/draft?tab=${tabs[index].param}`)
  }

  return { activeIndex, onTabChange }
}

const CreateOwnMarketPage = () => {
  const tabs = [
    {
      title: 'Draft',
      icon: <PlusIcon width={'16px'} height={'16px'} />,
      component: CreateMarket,
      param: 'draft',
    },
    {
      title: 'Queue AMM',
      icon: <LoadingIcon width={16} height={16} />,
      component: DraftMarketsQueue,
      param: 'queue-amm',
    },
    {
      title: 'Queue CLOB',
      icon: <LoadingIcon width={16} height={16} />,
      component: DraftMarketsQueueClob,
      param: 'queue-clob',
    },
    {
      title: 'Recent',
      icon: <CopyIcon width={16} height={16} />,
      component: RecentMarkets,
      param: 'recent',
    },
  ]

  const { activeIndex, onTabChange } = useTabLogic(tabs)

  return (
    <MainLayout>
      <Tabs
        height='100%'
        w='full'
        maxWidth='1000px'
        position='relative'
        variant='common'
        index={activeIndex}
        onChange={onTabChange}
      >
        <TabList justifyContent='center'>
          {tabs.map((tab, index) => (
            <Tab key={tab.title}>
              <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                {tab.icon}
                <Text fontWeight={activeIndex === index ? 700 : 'unset'}>{tab.title}</Text>
              </HStack>
            </Tab>
          ))}
        </TabList>
        <TabIndicator mt='-2px' height='2px' bg='grey.800' transitionDuration='200ms !important' />
        <TabPanels mt='30px'>
          {tabs.map(({ component: Component }, index) => (
            <TabPanel key={index}>
              <Component key={uuidv4()} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
