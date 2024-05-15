import { Button } from '@/components'
import { useBalanceService, useHistory } from '@/services'
import { borderRadius, colors } from '@/styles'
import { Flex, HStack, Heading, Spacer, Stack, StackProps, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaFileInvoiceDollar, FaTrophy, FaWallet } from 'react-icons/fa6'

export const PortfolioStats = ({ ...props }: StackProps) => {
  const router = useRouter()
  const { overallBalanceUsd } = useBalanceService()
  const { balanceInvested, balanceToWin } = useHistory()

  return (
    <Flex
      flexDir={{ sm: 'column', md: 'row' }}
      w={'full'}
      alignItems={'start'}
      gap={{ sm: 4, md: 6 }}
      {...props}
    >
      <Stack
        w={'full'}
        minH={{ base: '100px', md: '200px' }}
        p={5}
        borderRadius={borderRadius}
        bg={'bgLight'}
        spacing={4}
      >
        <HStack w={'full'}>
          <FaFileInvoiceDollar size={'24px'} fill={colors.fontLight} />
          <Text color={'fontLight'}>Invested</Text>
        </HStack>
        <Heading fontSize={'26px'}>{balanceInvested} USD</Heading>
      </Stack>

      <Stack
        w={'full'}
        minH={{ base: '100px', md: '200px' }}
        p={5}
        borderRadius={borderRadius}
        bg={'bgLight'}
        spacing={4}
      >
        <HStack w={'full'}>
          <FaTrophy size={'24px'} fill={colors.fontLight} />
          <Text color={'fontLight'}>To win</Text>
        </HStack>
        <Heading fontSize={'26px'}>{balanceToWin} USD</Heading>
      </Stack>

      <Stack
        w={'full'}
        minH={{ base: '100px', md: '200px' }}
        p={5}
        borderRadius={borderRadius}
        bg={'bgLight'}
        spacing={4}
      >
        <HStack w={'full'}>
          <FaWallet size={'24px'} fill={colors.fontLight} />
          <Text color={'fontLight'}>Balance</Text>
        </HStack>
        <Heading fontSize={'26px'}>{overallBalanceUsd} USD</Heading>
        <Spacer />
        <Button
          bg={'brand'}
          color={'white'}
          w={'full'}
          h={'32px'}
          py={1}
          onClick={() => router.push('/wallet')}
        >
          Top up
        </Button>
      </Stack>
    </Flex>
  )
}
