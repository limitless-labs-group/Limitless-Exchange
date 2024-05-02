'use client'

import { PortfolioStats, PortfolioPositions } from '@/app/portfolio/components'
import { PortfolioTrades } from '@/app/portfolio/components/PortfolioTrades'
import { MainLayout } from '@/components'
import { OpenEvent, PageOpenedMetadata, useAmplitude } from '@/services'
import { Box, HStack, Spacer, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const PortfolioPage = () => {
  const [tab, setTab] = useState<'Markets' | 'History'>('Markets')

  const { trackOpened } = useAmplitude()
  useEffect(() => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Portfolio Page',
    })
  }, [])

  return (
    <MainLayout>
      <PortfolioStats />

      <Stack w={'full'} spacing={5} mt={1}>
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
          <Stack
            cursor={'pointer'}
            onClick={() => {
              trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
                page: 'Portfolio - History tab',
              })
              setTab('History')
            }}
          >
            <Text fontWeight={tab == 'History' ? 'bold' : 'normal'}>History</Text>
            <Box
              w={'full'}
              h={'3px'}
              bg={'black'}
              visibility={tab == 'History' ? 'visible' : 'hidden'}
            />
          </Stack>
        </HStack>

        {tab == 'Markets' ? <PortfolioPositions /> : <PortfolioTrades />}
      </Stack>

      <Spacer />
    </MainLayout>
  )
}

export default PortfolioPage
