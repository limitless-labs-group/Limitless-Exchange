'use client'

import { PortfolioStats, PortfolioPositions, PortfolioHistory } from '@/app/portfolio/components'
import { MainLayout } from '@/components'
import { OpenEvent, PageOpenedMetadata, useAmplitude } from '@/services'
import { Box, Divider, HStack, Icon, Spacer, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import HistoryIcon from '@/resources/icons/history-icon.svg'
import { isMobile } from 'react-device-detect'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import TextWithPixels from '@/components/common/text-with-pixels'

const PortfolioPage = () => {
  const [tab, setTab] = useState<'Investments' | 'History'>('Investments')

  const { trackOpened } = useAmplitude()
  useEffect(() => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Portfolio Page',
    })
  }, [])

  return (
    <MainLayout>
      <Box w={isMobile ? 'auto' : '1016px'}>
        <Divider bg='black' orientation='horizontal' h='3px' />
        <TextWithPixels text={'Portfolio Overview'} fontSize={'32px'} gap={2} />
        <PortfolioStats mt={'20px'} />

        <Stack w={'full'} spacing={5} mt={1}>
          <HStack
            spacing={5}
            fontWeight={'bold'}
            fontSize={'15px'}
            borderBottom={'1px solid'}
            borderColor={'grey.400'}
          >
            <Stack cursor={'pointer'} onClick={() => setTab('Investments')}>
              <HStack>
                <Icon as={PortfolioIcon} w={'16px'} h={'16px'} />
                <Text fontWeight={tab == 'Investments' ? 'bold' : 'normal'}>Investments</Text>
              </HStack>
              <Box
                w={'full'}
                h={'3px'}
                bg={'black'}
                visibility={tab == 'Investments' ? 'visible' : 'hidden'}
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
              <HStack>
                <Icon as={HistoryIcon} w={'16px'} h={'16px'} />
                <Text fontWeight={tab == 'History' ? 'bold' : 'normal'}>History</Text>
              </HStack>
              <Box
                w={'full'}
                h={'3px'}
                bg={'black'}
                visibility={tab == 'History' ? 'visible' : 'hidden'}
              />
            </Stack>
          </HStack>

          {tab == 'Investments' ? <PortfolioPositions /> : <PortfolioHistory />}
        </Stack>

        <Spacer />
      </Box>
    </MainLayout>
  )
}

export default PortfolioPage
