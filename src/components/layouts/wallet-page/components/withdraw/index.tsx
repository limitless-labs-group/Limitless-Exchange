import { Box, Button, Checkbox, HStack, Input, InputGroup, Stack, Text } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { zeroAddress } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import SelectTokenField from '@/components/common/select-token-field'
import BaseIcon from '@/resources/crypto/base.svg'
import CheckedIcon from '@/resources/icons/checked-icon.svg'
import {
  ClickEvent,
  useAmplitude,
  useBalanceQuery,
  useBalanceService,
  useLimitlessApi,
} from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Token } from '@/types'
import { NumberUtil, truncateEthAddress } from '@/utils'

type WithdrawProps = {
  isOpen: boolean
}

export default function Withdraw({ isOpen }: WithdrawProps) {
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const { unwrap, setUnwrap, withdrawMutation } = useBalanceService()
  const { balanceOfSmartWallet } = useBalanceQuery()
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

  const { trackClicked } = useAmplitude()

  useEffect(() => {
    setAmount('')
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setUnwrap(false)
      return
    }
  }, [isOpen])

  const onResetWithdraw = async () => {
    await sleep(1)
    setAmount('')
    withdrawMutation.reset()
  }

  return (
    <>
      <Box mb='24px' overflowX='scroll' mt='24px'>
        <Text {...paragraphMedium} mb='4px'>
          Select coin
        </Text>
        <SelectTokenField token={selectedToken} setToken={setSelectedToken} />
        {selectedToken.address ===
          supportedTokens?.find((token) => token.symbol === 'WETH')?.address && (
          <Checkbox
            isChecked={unwrap}
            onChange={(e) => setUnwrap(e.target.checked)}
            mt={isMobile ? '16px' : '8px'}
            icon={<CheckedIcon color='grey.50' width={12} height={12} />}
          >
            Unwrap WETH and receive ETH
          </Checkbox>
        )}
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
        <ButtonWithStates
          variant='contained'
          status={withdrawMutation.status}
          isDisabled={isSubmitDisabled || !amount}
          onClick={async () => {
            trackClicked(ClickEvent.WithdrawConfirmedClicked, {
              coin: selectedToken.symbol,
              amount: amount,
            })
            await withdrawMutation.mutateAsync({ receiver: address, token: selectedToken, amount })
          }}
          w={isMobile ? 'full' : '82px'}
          mt={isMobile ? '32px' : '24px'}
          onReset={onResetWithdraw}
        >
          Withdraw
        </ButtonWithStates>
      </Stack>
    </>
  )
}
