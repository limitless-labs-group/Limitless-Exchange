import { useBalanceService, useLimitlessApi } from '@/services'
import { NumberUtil, truncateEthAddress } from '@/utils'
import {
  HStack,
  InputGroup,
  Stack,
  Switch,
  Text,
  useDisclosure,
  IconButton,
  Box,
  Input,
  Button,
} from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { zeroAddress } from 'viem'
import SelectTokenField from '@/components/common/select-token-field'
import { Token } from '@/types'
import BaseIcon from '@/resources/crypto/base.svg'
import BigNumber from 'bignumber.js'
import { isMobile } from 'react-device-detect'
import InfoIcon from '@/resources/icons/tooltip-icon.svg'
import { IModal, Modal } from '@/components/common/modals/modal'
import { Tooltip } from '@/components/common/tooltip'

type WithdrawModalProps = Omit<IModal, 'children'>

export const WithdrawModal = ({ onClose, isOpen, ...props }: WithdrawModalProps) => {
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
    setToken,
  } = useBalanceService()

  const disclosure = useDisclosure()

  const { supportedTokens } = useLimitlessApi()

  const [selectedToken, setSelectedToken] = useState((supportedTokens as Token[])[0])

  const balanceItem = useMemo(() => {
    if (balanceOfSmartWallet) {
      return balanceOfSmartWallet.find(
        (balance) => balance.contractAddress === selectedToken.address
      )
    }
  }, [balanceOfSmartWallet, selectedToken])

  const isSubmitDisabled = useMemo(() => {
    if (balanceItem) {
      return new BigNumber(balanceItem.formatted).isLessThanOrEqualTo(amount)
    }
  }, [balanceItem, amount])

  useEffect(() => {
    setAmount('')
    setAddressToWithdraw('')
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setUnwrap(false)
      return
    }
  }, [isOpen])

  useEffect(() => {
    setToken(selectedToken as Token)
  }, [selectedToken])

  return (
    <Modal size={'md'} title={`Withdraw crypto`} isOpen={isOpen} onClose={onClose} {...props}>
      <Box mb='24px' overflowX='scroll' mt='24px'>
        <Text fontWeight={500} fontSize='16px' mb='4px'>
          Select coin
        </Text>
        <SelectTokenField token={selectedToken} setToken={setSelectedToken} />
      </Box>
      <HStack gap='4px' mt='24px'>
        <Text fontWeight={500}>Address</Text>
        <BaseIcon />
        <Text fontWeight={500}>Base network</Text>
      </HStack>
      <Input
        variant='outlined'
        placeholder={truncateEthAddress(zeroAddress)}
        value={addressToWithdraw}
        onChange={(e) => setAddressToWithdraw(e.target.value)}
      />
      <HStack w={'full'} justifyContent={'space-between'} mt='24px' mb='4px'>
        <Text fontWeight={500}>Balance</Text>
        <Button
          variant='transparent'
          h='unset'
          onClick={() => setAmount(balanceItem ? balanceItem.formatted : '')}
        >
          {`${NumberUtil.toFixed(balanceItem ? balanceItem.formatted : '', 6)} ${
            selectedToken?.symbol
          }`}
        </Button>
      </HStack>
      <Input
        variant='outlined'
        placeholder='0'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Stack w={'full'} spacing={4}>
        <Stack w={'full'}>
          <InputGroup>
            {/* <InputLeftElement h={'full'} pointerEvents='none'>
              <FaDollarSign fill={colors.fontLight} />
            </InputLeftElement> */}
            {/*<Input*/}
            {/*  type={'number'}*/}
            {/*  fontWeight={'bold'}*/}
            {/*  placeholder={'0'}*/}
            {/*  value={amount}*/}
            {/*  onChange={(e) => setAmount(e.target.value)}*/}
            {/*/>*/}
          </InputGroup>
        </Stack>
        {selectedToken.address ===
          supportedTokens?.find((token) => token.symbol === 'WETH')?.address && (
          <HStack fontWeight={'bold'}>
            <Text color={unwrap ? 'fontLight' : 'font'}>WETH</Text>
            <Switch
              isChecked={unwrap}
              onChange={(e) => setUnwrap(e.target.checked)}
              isDisabled={status == 'Loading'}
            />
            <Text color={unwrap ? 'font' : 'fontLight'}>ETH</Text>
            <Tooltip
              isOpen={disclosure.isOpen}
              label={`Select WETH if you want to transfer wrapped ether (ERC20) tokens to your external wallet.\nSelect ETH if you want to unwrap it and transfer ether to your external wallet or exchange.`}
            >
              <IconButton
                variant='unstyled'
                minW='none'
                minHeight='auto'
                height='auto'
                aria-label='info'
                onMouseEnter={disclosure.onOpen}
                onMouseLeave={disclosure.onClose}
                onClick={disclosure.onToggle}
                icon={<InfoIcon />}
              />
            </Tooltip>
          </HStack>
        )}

        <Button
          variant='contained'
          isLoading={status == 'Loading'}
          isDisabled={isSubmitDisabled || status === 'Loading' || !amount}
          onClick={async () => {
            await withdraw(selectedToken.address)
            onClose()
          }}
          w={isMobile ? 'full' : 'fit-content'}
        >
          Withdraw
        </Button>
      </Stack>
    </Modal>
  )
}
