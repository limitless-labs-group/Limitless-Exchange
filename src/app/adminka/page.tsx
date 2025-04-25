'use client'

import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Modal } from '@/components/common/modals/modal'
import { AdminActiveMarkets } from './components/active'
import { DraftMarketModal } from './components/draft-modal'
import { AdminDraftMarkets } from './components/drafts'
import { AdminRecentMarkets } from './components/recent'
import { useCreateMarketModal } from '@/hooks/use-create-market-modal'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import LoadingIcon from '@/resources/icons/loader-icon.svg'
import ActiveIcon from '@/resources/icons/partially-filled-circle.svg'
import PlusIcon from '@/resources/icons/plus-icon.svg'
import { DraftMarketType, DraftMarket } from '@/types/draft'

type DraftMarketsQueueProps = {
  marketType: DraftMarketType
  markets?: DraftMarket[]
}

type BaseTab = {
  title: string
  icon: React.JSX.Element
  param: string
}

type SimpleTab = BaseTab & {
  component: React.FC
  marketType?: never
}

type MarketTypeTab = BaseTab & {
  component: React.FC<DraftMarketsQueueProps>
  marketType: DraftMarketType
}

export type Tab = SimpleTab | MarketTypeTab

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
    router.push(`/adminka?tab=${tabs[index].param}`)
  }

  return { activeIndex, onTabChange }
}

export default function AdminPage() {
  const { isOpen: isCreateOpen, toggle: onCreateToggle } = useCreateMarketModal()

  const tabs = [
    {
      title: 'Drafts',
      icon: <LoadingIcon width={16} height={16} />,
      component: AdminDraftMarkets,
      param: 'drafts',
    },
    {
      title: 'Active',
      icon: <ActiveIcon width={16} height={16} />,
      component: AdminActiveMarkets,
      param: 'active',
    },
    {
      title: 'Recent',
      icon: <CopyIcon width={16} height={16} />,
      component: AdminRecentMarkets,
      param: 'recent',
    },
  ]

  const { activeIndex, onTabChange } = useTabLogic(tabs)

  return (
    <Box display='flex' height='100%' w='full' maxWidth='1400px' position='relative'>
      <Box
        position='fixed'
        left='0'
        top='47px'
        width='250px'
        height='calc(100vh - 47px)'
        borderRight='1px solid var(--chakra-colors-grey-100)'
        bg='var(--chakra-colors-bg-primary)'
        zIndex='10'
        overflowY='auto'
        pt='16px'
      >
        <Text fontWeight='700' px='16px' mb='16px' fontSize='18px'>
          Admin Panel
        </Text>

        {tabs.map((tab, index) => (
          <Box
            key={tab.title}
            onClick={() => onTabChange(index)}
            cursor='pointer'
            py='12px'
            px='16px'
            bg={activeIndex === index ? 'grey.100' : 'transparent'}
            borderRight={
              activeIndex === index
                ? '3px solid var(--chakra-colors-grey-800)'
                : '3px solid transparent'
            }
            _hover={{ bg: 'grey.50' }}
            transition='all 0.2s'
          >
            <HStack gap='8px' w='fit-content'>
              {tab.icon}
              <Text fontWeight={activeIndex === index ? 700 : 400}>
                {tab.title}
                {tab.title === 'Draft' && ` ()`}
              </Text>
            </HStack>
          </Box>
        ))}
      </Box>

      <Box flex='1' pl='250px'>
        <HStack justifyContent='space-between'>
          <Text>Drafts</Text>
          <Button size='sm' variant='white' onClick={onCreateToggle}>
            <PlusIcon />
            <Text>Create market</Text>
          </Button>
        </HStack>
        <Modal isOpen={isCreateOpen} onClose={onCreateToggle} maxW='1080px' minH='700px'>
          <DraftMarketModal />
        </Modal>
        <Box minH='800px'>
          {tabs.map(({ component: Component }, index) => (
            <Box key={index} display={activeIndex === index ? 'block' : 'none'} pt='20px'>
              <Component key={uuidv4()} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
