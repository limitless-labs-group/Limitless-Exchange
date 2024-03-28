'use client'

import { PortfolioStats, PortfolioMarketsTable } from '@/app/portfolio/components'
import { PortfolioHistoryTable } from '@/app/portfolio/components/PortfolioHistoryTable'
import { MainLayout } from '@/components'
import { Box, HStack, Spacer, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

const PortfolioPage = () => {
  const [tab, setTab] = useState<'Markets' | 'History'>('Markets')

  return (
    <MainLayout>
      <PortfolioStats />

      <Stack w={'full'} spacing={5}>
        <HStack spacing={5} fontWeight={'bold'} fontSize={'15px'}>
          <Stack cursor={'pointer'} onClick={() => setTab('Markets')}>
            <Text fontWeight={tab == 'Markets' ? 'bold' : 'normal'}>My markets</Text>
            <Box
              w={'full'}
              h={'3px'}
              bg={'black'}
              visibility={tab == 'Markets' ? 'visible' : 'hidden'}
            />
          </Stack>
          <Stack cursor={'pointer'} onClick={() => setTab('History')}>
            <Text fontWeight={tab == 'History' ? 'bold' : 'normal'}>History</Text>
            <Box
              w={'full'}
              h={'3px'}
              bg={'black'}
              visibility={tab == 'History' ? 'visible' : 'hidden'}
            />
          </Stack>
        </HStack>

        {tab == 'Markets' ? <PortfolioMarketsTable /> : <PortfolioHistoryTable />}
      </Stack>

      <Spacer />
    </MainLayout>
  )
}

export default PortfolioPage
