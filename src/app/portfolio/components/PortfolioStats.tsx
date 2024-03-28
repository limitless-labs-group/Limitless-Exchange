import { Button } from '@/components'
import { useBalanceService, useHistory } from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import { Divider, HStack, Heading, Spacer, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaFileInvoiceDollar, FaTrophy, FaWallet } from 'react-icons/fa6'

export const PortfolioStats = ({ ...props }: StackProps) => {
  const router = useRouter()
  const { balanceOfSmartWallet } = useBalanceService()
  const { balanceUsd, balanceShares } = useHistory()

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      alignItems={{ sm: 'start', md: 'center' }}
      flexDir={{ sm: 'column', md: 'row' }}
      spacing={{ sm: 4, md: 6 }}
      {...props}
    >
      <VStack
        w={'full'}
        p={8}
        justifyContent={'center'}
        boxShadow={`0 1px 4px ${colors.border}`}
        borderRadius={borderRadius}
        bg={'bgLight'}
        spacing={4}
      >
        <FaFileInvoiceDollar size={'32px'} />
        <Stack alignItems={'center'}>
          <Heading fontSize={'28px'}>${balanceUsd.toFixed(2)}</Heading>
          <Text color={'fontLight'}>Invested</Text>
        </Stack>
      </VStack>

      <VStack
        w={'full'}
        p={8}
        justifyContent={'center'}
        boxShadow={`0 1px 4px ${colors.border}`}
        borderRadius={borderRadius}
        bg={'bgLight'}
        spacing={4}
      >
        <FaTrophy size={'32px'} />
        <Stack alignItems={'center'}>
          <Heading fontSize={'28px'}>${balanceShares.toFixed(2)}</Heading>
          <Text color={'fontLight'}>To win</Text>
        </Stack>
      </VStack>

      <VStack
        w={'full'}
        p={8}
        justifyContent={'center'}
        boxShadow={`0 1px 4px ${colors.border}`}
        borderRadius={borderRadius}
        bg={'bgLight'}
        spacing={4}
      >
        <FaWallet size={'32px'} />
        <Stack alignItems={'center'}>
          <Heading fontSize={'28px'}>
            ${NumberUtil.toFixed(balanceOfSmartWallet?.formatted)}
          </Heading>
          <HStack>
            <Text color={'fontLight'}>Balance</Text>
            <Button
              bg={'brand'}
              color={'white'}
              size={'sm'}
              h={'auto'}
              py={1}
              onClick={() => router.push('/wallet')}
            >
              Top up
            </Button>
          </HStack>
        </Stack>
      </VStack>
    </Stack>
  )
}
