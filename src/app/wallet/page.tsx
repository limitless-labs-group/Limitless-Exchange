'use client'

import {
  BalanceCard,
  DepositTestnetCard,
  DepositByQrCard,
  DepositDisclaimer,
} from '@/app/wallet/components'
import { Button, MainLayout } from '@/components'
import { defaultChain } from '@/constants'
import { OpenEvent, useAmplitude, useAuth } from '@/services'
import { colors } from '@/styles'
import { Flex, Spacer, Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { FaCircle, FaComments } from 'react-icons/fa'

const WalletPage = () => {
  const { signIn: signInWithW3A, isLoggedIn } = useAuth()
  const { trackOpened } = useAmplitude()

  useEffect(() => {
    if (!isLoggedIn) {
      signInWithW3A()
    }

    trackOpened(OpenEvent.PageOpened, {
      page: 'Deposit Page',
    })
  }, [])

  return (
    <MainLayout maxContentWidth={'1200px'}>
      <Flex gap={{ sm: 2, md: 6 }} flexDir={{ sm: 'column-reverse', md: 'row' }}>
        <Stack flexBasis={'66%'}>
          <DepositByQrCard />
          <DepositDisclaimer />
          {defaultChain.testnet && <DepositTestnetCard />}
        </Stack>
        <Stack flexBasis={'33%'}>
          <BalanceCard />
          <Button
            colorScheme={'transparent'}
            border={`1px solid ${colors.border}`}
            leftIcon={<FaComments size={'18px'} />}
            rightIcon={<FaCircle fill='green' size={'8px'} />}
            onClick={() => window.open('https://discord.gg/rSJJrehEyH', '_blank', 'noopener')}
          >
            Talk to human
          </Button>
        </Stack>
        <Spacer />
      </Flex>
    </MainLayout>
  )
}

export default WalletPage
