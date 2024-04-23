import { Button, IModal, InfoIcon, Input, Modal, Tooltip } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { useBalanceService } from '@/services'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { HStack, Heading, InputGroup, Stack, Switch, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { zeroAddress } from 'viem'

export const WithdrawModal = ({ onClose, isOpen, ...props }: Omit<IModal, 'children'>) => {
  const {
    balanceOfSmartWallet,
    amount,
    setAmount,
    addressToWithdraw,
    setAddressToWithdraw,
    unwrap,
    setUnwrap,
    withdraw,
    status,
  } = useBalanceService()

  useEffect(() => {
    setAmount('')
    setAddressToWithdraw('')
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
                onClick={() => setAmount(balanceOfSmartWallet?.formatted ?? '')}
              >
                {`Balance: ${balanceOfSmartWallet?.formatted} ${collateralToken.symbol}`}
              </Button>
            </HStack>
          </HStack>

          <InputGroup>
            {/* <InputLeftElement h={'full'} pointerEvents='none'>
              <FaDollarSign fill={colors.fontLight} />
            </InputLeftElement> */}
            <Input
              type={'number'}
              fontWeight={'bold'}
              placeholder={'0'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </InputGroup>
        </Stack>

        <HStack fontWeight={'bold'}>
          <Text color={unwrap ? 'fontLight' : 'font'}>WETH</Text>
          <Switch
            isChecked={unwrap}
            onChange={(e) => setUnwrap(e.target.checked)}
            isDisabled={status == 'Loading'}
          />
          <Text color={unwrap ? 'font' : 'fontLight'}>ETH</Text>
          <Tooltip
            label={`Select WETH if you want to transfer wrapped ether (ERC20) tokens to your external wallet.\nSelect ETH if you want to unwrap it and transfer ether to your external wallet or exchange.`}
          >
            <InfoIcon fontSize={'9px'} p={'3px'} />
          </Tooltip>
        </HStack>

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
