import { WithdrawModal } from '@/app/wallet/components'
import { Button } from '@/components'
import { collateralToken } from '@/constants'
import { useBalanceService } from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import { HStack, Heading, Spinner, Stack, StackProps, useDisclosure } from '@chakra-ui/react'
import { FaCircle } from 'react-icons/fa'

export const BalanceCard = ({ ...props }: StackProps) => {
  const { balanceOfSmartWallet, status } = useBalanceService()
  const {
    isOpen: isOpenWithdraw,
    onOpen: onOpenWithdraw,
    onClose: onCloseWithdraw,
  } = useDisclosure()

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      p={4}
      bg={'bgLight'}
      border={`1px solid ${colors.border}`}
      // boxShadow={`0 0 8px ${colors.border}`}
      borderRadius={borderRadius}
      alignItems={'start'}
      spacing={3}
      {...props}
    >
      <HStack>
        <Heading
          fontSize={'11px'}
          color={'fontLight'}
          textTransform={'uppercase'}
          letterSpacing={'0.15em'}
        >
          Balance
        </Heading>
        <FaCircle fill='green' size={'8px'} />
      </HStack>

      <Heading>
        {status == 'Loading' ? (
          <Spinner />
        ) : (
          `${NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 3)} ${collateralToken.symbol}`
        )}
      </Heading>

      <Button colorScheme={'brand'} h={'30px'} onClick={onOpenWithdraw}>
        Withdraw
      </Button>

      <WithdrawModal isOpen={isOpenWithdraw} onClose={onCloseWithdraw} />
    </Stack>
  )
}
