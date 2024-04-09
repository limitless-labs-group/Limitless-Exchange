'use client'

import { BalanceCard, DepositByMintCard, DepositByQrCard } from '@/app/wallet/components'
import { Button, MainLayout } from '@/components'
import { defaultChain } from '@/constants'
import {
  ClickEvent,
  OpenEvent,
  SupportChatClickedMetadata,
  useAmplitude,
  useAuth,
} from '@/services'
import { colors } from '@/styles'
import { Flex, Spacer, Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { FaCircle, FaComments } from 'react-icons/fa'

const WalletPage = () => {
  const { signIn: signInWithW3A, isLoggedIn } = useAuth()
  const { trackOpened, trackClicked } = useAmplitude()

  useEffect(() => {
    if (!isLoggedIn) {
      signInWithW3A()
    }

    trackOpened(OpenEvent.PageOpened, {
      page: 'Deposit Page',
    })
  }, [])

  return (
    <MainLayout>
      <Flex gap={{ sm: 2, md: 6 }} flexDir={{ sm: 'column-reverse', md: 'row' }}>
        <Stack flexBasis={'66%'}>
          <DepositByQrCard />
          {/* {defaultChain.testnet && */}
          <DepositByMintCard />
          {/* } */}
        </Stack>
        <Stack flexBasis={'33%'}>
          <BalanceCard />
          <Button
            colorScheme={'transparent'}
            border={`1px solid ${colors.border}`}
            leftIcon={<FaComments size={'18px'} />}
            rightIcon={<FaCircle fill='green' size={'8px'} />}
            onClick={() => {
              trackClicked<SupportChatClickedMetadata>(ClickEvent.SupportChatClicked, {
                page: 'Deposit Page',
              })
              window.open('https://discord.gg/rSJJrehEyH', '_blank')
            }}
          >
            Chat with human
          </Button>
        </Stack>
        <Spacer />
      </Flex>
    </MainLayout>
  )
}

export default WalletPage
