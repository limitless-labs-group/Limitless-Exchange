import { Button } from '@/components'
import { collateralToken } from '@/constants'
import { usePriceOracle } from '@/providers'
import { useBalanceService, useHistory } from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import { HStack, Heading, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaFileInvoiceDollar, FaTrophy, FaWallet } from 'react-icons/fa6'

export const PortfolioStats = ({ ...props }: StackProps) => {
  const router = useRouter()
  const { balanceOfSmartWallet } = useBalanceService()
  const { balanceInvested, balanceToWin } = useHistory()
  const { convertEthToUsd } = usePriceOracle()

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
          <Heading fontSize={'28px'}>{`${NumberUtil.toFixed(balanceInvested, 4)} ${
            collateralToken.symbol
          }`}</Heading>
          <Text color={'fontLight'}>
            ~${NumberUtil.toFixed(convertEthToUsd(balanceInvested), 2)}
          </Text>
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
          <Heading fontSize={'28px'}>{`${NumberUtil.toFixed(balanceToWin, 4)} ${
            collateralToken.symbol
          }`}</Heading>
          <Text color={'fontLight'}>~${NumberUtil.toFixed(convertEthToUsd(balanceToWin), 2)}</Text>
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
            {`${NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 4)} ${collateralToken.symbol}`}
          </Heading>
          <Text color={'fontLight'}>
            ~${NumberUtil.formatThousands(convertEthToUsd(balanceOfSmartWallet?.formatted), 2)}
          </Text>
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
