import { Button } from '@/components'
import { collateralToken } from '@/constants'
import { usePriceOracle } from '@/providers'
import { useBalanceService, useHistory } from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import { Grid, HStack, Heading, Stack, StackProps, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaFileInvoiceDollar, FaTrophy, FaWallet } from 'react-icons/fa6'

export const PortfolioStats = ({ ...props }: StackProps) => {
  const router = useRouter()
  const { balanceOfSmartWallet } = useBalanceService()
  const { balanceInvested, balanceToWin } = useHistory()
  const { convertEthToUsd } = usePriceOracle()

  return (
    <Grid
      templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
      w={'full'}
      alignItems={'start'}
      gap={{ sm: 4, md: 6 }}
      {...props}
    >
      <Stack w={'full'} h={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
        <HStack w={'full'}>
          <FaFileInvoiceDollar size={'24px'} fill={colors.fontLight} />
          <Text color={'fontLight'}>Invested</Text>
        </HStack>
        <Stack w={'full'} spacing={1}>
          <Heading fontSize={'26px'}>{`${NumberUtil.toFixed(balanceInvested, 4)} ${
            collateralToken.symbol
          }`}</Heading>
          <Text color={'fontLight'}>
            ~${NumberUtil.toFixed(convertEthToUsd(balanceInvested), 2)}
          </Text>
        </Stack>
      </Stack>

      <Stack w={'full'} h={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
        <HStack w={'full'}>
          <FaTrophy size={'24px'} fill={colors.fontLight} />
          <Text color={'fontLight'}>To win</Text>
        </HStack>
        <Stack w={'full'} spacing={1}>
          <Heading fontSize={'26px'}>{`${NumberUtil.toFixed(balanceToWin, 4)} ${
            collateralToken.symbol
          }`}</Heading>
          <Text color={'fontLight'}>~${NumberUtil.toFixed(convertEthToUsd(balanceToWin), 2)}</Text>
        </Stack>
      </Stack>

      <Stack w={'full'} h={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
        <HStack w={'full'}>
          <FaWallet size={'24px'} fill={colors.fontLight} />
          <Text color={'fontLight'}>Balance</Text>
        </HStack>
        <Stack w={'full'} spacing={5}>
          <Stack w={'full'} spacing={1}>
            <Heading fontSize={'26px'}>
              {`${NumberUtil.toFixedWSN(balanceOfSmartWallet?.formatted, 4)} ${
                collateralToken.symbol
              }`}
            </Heading>
            <Text color={'fontLight'}>
              ~${NumberUtil.formatThousands(convertEthToUsd(balanceOfSmartWallet?.formatted), 2)}
            </Text>
          </Stack>

          <Button
            bg={'brand'}
            color={'white'}
            w={'full'}
            h={'40px'}
            py={1}
            onClick={() => router.push('/wallet')}
          >
            Top up
          </Button>
        </Stack>
      </Stack>
    </Grid>
  )
}
