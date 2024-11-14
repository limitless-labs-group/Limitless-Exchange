'use client'

import { Box, Divider, HStack, Icon, Spacer, Stack, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useAccount as useWagmiAccount } from 'wagmi'
import TextWithPixels from '@/components/common/text-with-pixels'
import { PortfolioStats, PortfolioPositions, PortfolioHistory } from '@/app/portfolio/components'
import { MainLayout } from '@/components'
import HistoryIcon from '@/resources/icons/history-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import {
  OpenEvent,
  PageOpenedMetadata,
  useAccount,
  useAmplitude,
  useEtherspot,
  useTradingService,
} from '@/services'
import { h1Regular, paragraphMedium } from '@/styles/fonts/fonts.styles'

const PortfolioPage = () => {
  const [tab, setTab] = useState<'Investments' | 'History'>('Investments')

  const { trackOpened } = useAmplitude()
  const { onCloseMarketPage } = useTradingService()
  const { isLoadingSmartWalletAddress } = useEtherspot()
  const { isConnected, isConnecting } = useWagmiAccount()
  const { profileData, profileLoading } = useAccount()

  const userMenuLoading = useMemo(() => {
    if (isConnecting) {
      return true
    }
    if (isConnected) {
      return profileData === undefined || profileLoading || isLoadingSmartWalletAddress
    }
    return false //#fix for dev env
  }, [isConnected, profileLoading, isLoadingSmartWalletAddress, isConnecting, profileData])

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
    <MainLayout>
      <Box w={isMobile ? 'full' : 'calc(100vw - 720px)'}>
        <Divider bg='grey.800' orientation='horizontal' h='3px' />
        <TextWithPixels
          text={'Portfolio Overview'}
          {...(isMobile ? { ...h1Regular } : {})}
          fontSize='32px'
          gap={2}
        />
        <PortfolioStats mt={'20px'} />

        <Stack w={'full'} spacing={5}>
          <HStack gap={0} borderBottom={'1px solid'} borderColor={'grey.400'} alignItems='flex-end'>
            <Stack cursor={'pointer'} onClick={() => setTab('Investments')} mb='-1px' gap={0}>
              <HStack
                color={tab === 'Investments' ? 'grey.800' : 'grey.500'}
                px='8px'
                gap='4px'
                mb='4px'
              >
                <Icon as={PortfolioIcon} w={'16px'} h={'16px'} />
                <Text {...paragraphMedium} color={tab === 'Investments' ? 'grey.800' : 'grey.500'}>
                  Investments
                </Text>
              </HStack>
              <Box
                w={'full'}
                h={'3px'}
                bg={'grey.800'}
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
              mb='-1px'
              gap={0}
            >
              <HStack
                color={tab === 'History' ? 'grey.800' : 'grey.500'}
                px='8px'
                gap='4px'
                mb='4px'
              >
                <Icon as={HistoryIcon} w={'16px'} h={'16px'} />
                <Text {...paragraphMedium} color={tab === 'History' ? 'grey.800' : 'grey.500'}>
                  History
                </Text>
              </HStack>
              <Box
                w={'full'}
                h={'3px'}
                bg={'grey.800'}
                visibility={tab == 'History' ? 'visible' : 'hidden'}
              />
            </Stack>
          </HStack>

          {tab == 'Investments' ? (
            <PortfolioPositions userMenuLoading={userMenuLoading} />
          ) : (
            <PortfolioHistory userMenuLoading={userMenuLoading} />
          )}
        </Stack>

        <Spacer />
      </Box>
    </MainLayout>
  )
}

export default PortfolioPage
