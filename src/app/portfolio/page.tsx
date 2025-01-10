'use client'

import { Box, Divider, Heading, HStack, Icon, Spacer, Stack, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useAccount as useWagmiAccount } from 'wagmi'
import { PortfolioStats, PortfolioPositions, PortfolioHistory } from '@/app/portfolio/components'
import { TabButton } from './components/tab-button'
import HistoryIcon from '@/resources/icons/history-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import {
  OpenEvent,
  PageOpenedMetadata,
  useAccount,
  useAmplitude,
  useTradingService,
} from '@/services'
import { h1Bold } from '@/styles/fonts/fonts.styles'

const PortfolioPage = () => {
  const [tab, setTab] = useState<'Investments' | 'History'>('Investments')

  const { trackOpened } = useAmplitude()
  const { onCloseMarketPage } = useTradingService()
  const { isConnected, isConnecting } = useWagmiAccount()
  const { profileData, profileLoading } = useAccount()

  const isLoadingSmartWalletAddress = false

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
    <Box w={isMobile ? 'full' : 'calc(100vw - 720px)'}>
      <Divider orientation='horizontal' h='3px' borderColor='grey.800' bg='grey.800' />
      <Heading {...h1Bold} gap={2}>
        Portfolio Overview
      </Heading>
      <PortfolioStats mt={'20px'} />

      <Stack w={'full'} spacing={5}>
        <HStack gap={0} borderBottom={'1px solid'} borderColor={'grey.400'} alignItems='flex-end'>
          <TabButton
            isActive={tab === 'Investments'}
            icon={PortfolioIcon}
            label='Investments'
            onClick={() => setTab('Investments')}
          />
          <TabButton
            isActive={tab === 'History'}
            icon={HistoryIcon}
            label='History'
            onClick={() => setTab('History')}
          />
        </HStack>

        {tab == 'Investments' ? (
          <PortfolioPositions userMenuLoading={userMenuLoading} />
        ) : (
          <PortfolioHistory />
        )}
      </Stack>

      <Spacer />
    </Box>
  )
}

export default PortfolioPage
