import type { StackProps } from '@chakra-ui/react'
import { HStack, Stack, Text, VStack } from '@chakra-ui/react'
import type { Address } from 'viem'

import { Button } from '@/components'
import { useBalanceService } from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import { useIsMobile } from '@/hooks'
import { defaultChain, weth } from '@/constants'

type BalanceCardProps = StackProps & {
  handleOpenTopUpModal: (token: Address) => void
  handleOpenWithdrawModal: () => void
}

export const BalanceCard = ({
  handleOpenTopUpModal,
  handleOpenWithdrawModal,
  ...props
}: BalanceCardProps) => {
  /**
   * BALANCE
   */
  const { overallBalanceUsd } = useBalanceService()
  const isMobile = useIsMobile()

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      p={isMobile ? 0 : 5}
      border={isMobile ? 'unset' : `1px solid ${colors.border}`}
      borderRadius={borderRadius}
      alignItems={'start'}
      spacing={3}
      {...props}
    >
      <HStack
        justifyContent='space-between'
        w={'full'}
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'center'}
      >
        <VStack alignItems='left'>
          <Text fontSize='20px'>Estimated Balance</Text>
          <Text fontSize='24px' fontWeight={'bold'}>
            ~ {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
          </Text>
        </VStack>
        <VStack
          flexDirection={isMobile ? 'row' : 'column'}
          gap={'16px'}
          w={isMobile ? 'full' : 'unset'}
        >
          <Button
            colorScheme={'brand'}
            w={isMobile ? 'full' : '200px'}
            h={'30px'}
            onClick={() => handleOpenTopUpModal(weth.address[defaultChain.id])}
          >
            Top Up
          </Button>
          <Button w={isMobile ? 'full' : '200px'} h={'30px'} onClick={handleOpenWithdrawModal}>
            Withdraw
          </Button>
        </VStack>
      </HStack>
    </Stack>
  )
}
