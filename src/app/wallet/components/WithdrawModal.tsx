import { Button, IModal, Input, Modal } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { useBalanceService } from '@/services'
import { colors } from '@/styles'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { HStack, Heading, InputGroup, InputLeftElement, Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { FaDollarSign } from 'react-icons/fa'
import { zeroAddress } from 'viem'

export const WithdrawModal = ({ onClose, isOpen, ...props }: Omit<IModal, 'children'>) => {
  const {
    setStrategy,
    balanceOfSmartWallet,
    amount,
    setAmount,
    addressToWithdraw,
    setAddressToWithdraw,
    withdraw,
    status,
  } = useBalanceService()

  useEffect(() => {
    setStrategy('Withdraw')
    setAmount(undefined)
    setAddressToWithdraw(undefined)
  }, [isOpen])

  return (
    <Modal size={'md'} title={'Withdraw'} isOpen={isOpen} onClose={onClose} {...props}>
      <Stack w={'full'} spacing={4}>
        <Stack w={'full'}>
          <Heading fontSize={'15px'}>Address on {defaultChain.name} network</Heading>

          <Input
            fontSize={{ sm: '12px', md: '14px' }}
            pr={0}
            placeholder={truncateEthAddress(zeroAddress)}
            value={addressToWithdraw}
            onChange={(e) => setAddressToWithdraw(e.target.value)}
          />
        </Stack>

        <Stack w={'full'}>
          <HStack w={'full'} justifyContent={'space-between'}>
            <Heading fontSize={'15px'}>Amount</Heading>
            <HStack>
              <Button
                h={'24px'}
                px={2}
                fontSize={'12px'}
                onClick={() => setAmount(NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 4))}
              >
                {`Balance: ${NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 3)} ${
                  collateralToken.symbol
                }`}
              </Button>
              <Button
                h={'24px'}
                px={2}
                fontSize={'12px'}
                bg={'black'}
                color={'white'}
                onClick={() => setAmount(NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 4))}
              >
                Max
              </Button>
            </HStack>
          </HStack>

          <InputGroup>
            <InputLeftElement h={'full'} pointerEvents='none'>
              <FaDollarSign fill={colors.fontLight} />
            </InputLeftElement>
            <Input
              type={'number'}
              px={7}
              fontWeight={'bold'}
              placeholder={'0'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </InputGroup>
        </Stack>

        <Button
          colorScheme={'brand'}
          w={'full'}
          isLoading={status == 'Loading'}
          isDisabled={status != 'ReadyToFund'}
          onClick={async () => {
            await withdraw()
            onClose()
          }}
        >
          Withdraw
        </Button>
      </Stack>
    </Modal>
  )
}
