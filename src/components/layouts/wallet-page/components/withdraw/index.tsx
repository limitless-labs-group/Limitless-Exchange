import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Stack,
  Switch,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import SelectTokenField from '@/components/common/select-token-field'
import BaseIcon from '@/resources/crypto/base.svg'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { zeroAddress } from 'viem'
import { Tooltip } from '@/components/common/tooltip'
import InfoIcon from '@/resources/icons/tooltip-icon.svg'
import { isMobile } from 'react-device-detect'
import React, { useEffect, useMemo, useState } from 'react'
import { IModal } from '@/components/common/modals/modal'
import { useBalanceService, useLimitlessApi } from '@/services'
import { Token } from '@/types'
import BigNumber from 'bignumber.js'

type WithdrawProps = Omit<IModal, 'children'>

export default function Withdraw({ isOpen, onClose }: WithdrawProps) {
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const { balanceOfSmartWallet, unwrap, setUnwrap, withdraw, status } = useBalanceService()

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
      return new BigNumber(balanceItem.formatted).isLessThan(new BigNumber(amount))
    }
  }, [balanceItem, amount])

  useEffect(() => {
    setAmount('')
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setUnwrap(false)
      return
    }
  }, [isOpen])

  return (
    <>
      <Box mb='24px' overflowX='scroll' mt='24px'>
        <Text {...paragraphMedium} mb='4px'>
          Select coin
        </Text>
        <SelectTokenField token={selectedToken} setToken={setSelectedToken} />
      </Box>
      <HStack gap='4px' mt='24px' mb='4px'>
        <Text {...paragraphMedium}>Address</Text>
        <BaseIcon />
        <Text {...paragraphMedium}>Base network</Text>
      </HStack>
      <InputGroup>
        <Input
          variant='grey'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={truncateEthAddress(zeroAddress)}
        />
      </InputGroup>
      <HStack w={'full'} justifyContent={'space-between'} mt='24px' mb='4px'>
        <Text {...paragraphMedium}>Balance</Text>
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
      <InputGroup>
        <Input
          variant='grey'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder='0'
          type='number'
        />
      </InputGroup>
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
            await withdraw({ receiver: address, token: selectedToken, amount })
            onClose()
          }}
          w={isMobile ? 'full' : 'fit-content'}
        >
          Withdraw
        </Button>
      </Stack>
    </>
  )
}
