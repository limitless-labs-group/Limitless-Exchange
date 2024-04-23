import { WithdrawModal } from '@/app/wallet/components'
import { Button } from '@/components'
import { collateralToken } from '@/constants'
import { usePriceOracle } from '@/providers'
import { useBalanceService } from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import {
  HStack,
  Heading,
  Image,
  Spinner,
  Stack,
  StackProps,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useMemo } from 'react'

export const BalanceCard = ({ ...props }: StackProps) => {
  /**
   * UI
   */
  const {
    isOpen: isOpenWithdraw,
    onOpen: onOpenWithdraw,
    onClose: onCloseWithdraw,
  } = useDisclosure()

  /**
   * BALANCE
   */
  const { balanceOfSmartWallet, status } = useBalanceService()

  /**
   * PRICE ORACLE
   */
  const { convertEthToUsd, ethPrice } = usePriceOracle()

  const balanceUsd = useMemo(() => {
    return NumberUtil.formatThousands(convertEthToUsd(balanceOfSmartWallet?.formatted), 2)
  }, [balanceOfSmartWallet])

  const ethPriceFormatted = useMemo(() => {
    return NumberUtil.formatThousands(ethPrice, 2)
  }, [ethPrice])

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      p={5}
      border={`1px solid ${colors.border}`}
      borderRadius={borderRadius}
      alignItems={'start'}
      spacing={3}
      {...props}
    >
      <HStack>
        <Image w={'30px'} src={collateralToken.imageURI} />
        <Stack spacing={0}>
          <Heading size={'sm'}>{collateralToken.symbol}</Heading>
          <Text color={'fontLight'}>{collateralToken.name}</Text>
        </Stack>
      </HStack>

      <HStack w={'full'} alignItems={'start'}>
        <Stack flexBasis={'50%'}>
          <Text fontSize={'12px'} color={'fontLight'}>
            Balance
          </Text>
          <Stack spacing={0}>
            <Text fontWeight={'bold'}>
              {status == 'Loading' ? <Spinner size={'sm'} /> : balanceOfSmartWallet?.formatted}
            </Text>
            <Text fontSize={'12px'} color={'fontLight'}>
              ~${balanceUsd}
            </Text>
          </Stack>
        </Stack>
        <Stack>
          <Text fontSize={'12px'} color={'fontLight'}>
            Token Price
          </Text>
          <Text>~${ethPriceFormatted}</Text>
        </Stack>
      </HStack>

      <Button h={'40px'} w={'full'} bg={'gray'} color={'white'} onClick={onOpenWithdraw}>
        Withdraw
      </Button>

      <WithdrawModal isOpen={isOpenWithdraw} onClose={onCloseWithdraw} />
    </Stack>
  )
}
