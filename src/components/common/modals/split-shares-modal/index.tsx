import { Box, HStack, Input, InputGroup, InputRightElement, Text } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address, parseUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import { Modal } from '@/components/common/modals/modal'
import { useBalanceQuery, useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface SplitSharesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SplitSharesModal({ isOpen, onClose }: SplitSharesModalProps) {
  const [displayAmount, setDisplayAmount] = useState('')
  const [allowance, setAllowance] = useState<bigint>(0n)
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { splitSharesMutation, market } = useTradingService()
  const { checkAllowance, client, approveContract } = useWeb3Service()

  const usdcBalance =
    balanceOfSmartWallet?.find((balanceItem) => balanceItem.symbol === 'USDC')?.formatted || '0.00'

  const isExceedsBalance = useMemo(() => {
    if (+displayAmount && usdcBalance) {
      return +displayAmount > +usdcBalance
    }
    return false
  }, [displayAmount, usdcBalance])

  const handleAmountChange = (value: string) => {
    setDisplayAmount(value)
  }

  const handleSplitClicked = async () =>
    splitSharesMutation.mutateAsync({
      amount: displayAmount,
      decimals: market?.collateralToken.decimals || 6,
      conditionId: market?.conditionId as string,
      contractAddress: market?.collateralToken.address as Address,
    })

  const checkSplitAllowance = async () => {
    const allowance = await checkAllowance(
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
      market?.collateralToken.address as Address
    )
    setAllowance(allowance)
  }

  const approveContractMutation = useMutation({
    mutationFn: async () => {
      await approveContract(
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
        market?.collateralToken.address as Address,
        parseUnits(displayAmount, market?.collateralToken.decimals || 6)
      )
      await sleep(3)
      await checkSplitAllowance()
    },
  })

  const actionButton = useMemo(() => {
    if (client === 'etherspot') {
      return (
        <ButtonWithStates
          variant='contained'
          w={isMobile ? 'full' : '94px'}
          isDisabled={!+displayAmount || isExceedsBalance}
          onClick={handleSplitClicked}
          status={splitSharesMutation.status}
        >
          Split shares
        </ButtonWithStates>
      )
    }
    if (allowance < parseUnits(displayAmount, market?.collateralToken.decimals || 6)) {
      return (
        <ButtonWithStates
          variant='contained'
          w={isMobile ? 'full' : '94px'}
          isDisabled={!+displayAmount || isExceedsBalance}
          onClick={() => approveContractMutation.mutateAsync()}
          status={approveContractMutation.status}
        >
          Approve
        </ButtonWithStates>
      )
    }
    return (
      <ButtonWithStates
        variant='contained'
        w={isMobile ? 'full' : '94px'}
        isDisabled={!+displayAmount || isExceedsBalance}
        onClick={handleSplitClicked}
        status={splitSharesMutation.status}
      >
        Split shares
      </ButtonWithStates>
    )
  }, [
    allowance,
    approveContractMutation,
    client,
    displayAmount,
    isExceedsBalance,
    market?.collateralToken.decimals,
    splitSharesMutation.status,
  ])

  useEffect(() => {
    checkSplitAllowance()
  }, [])

  const modalContent = (
    <Box>
      <Text {...paragraphRegular} mt='12px'>
        Split a USDC into a share of Yes and No. You can do this to save cost by getting both and
        just selling the other side.
      </Text>
      <InputGroup display='block' mt='16px'>
        <HStack justifyContent='space-between' mb='4px'>
          <Text {...paragraphMedium}>Amount</Text>
          {isExceedsBalance && (
            <Text {...paragraphMedium} color='red.500'>
              Invalid amount
            </Text>
          )}
        </HStack>
        <Input
          isInvalid={isExceedsBalance}
          variant='grey'
          errorBorderColor='red.500'
          value={displayAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder='0'
          type='number'
        />
        <InputRightElement
          h='16px'
          top={isMobile ? '28px' : '24px'}
          right={isMobile ? '12px' : '8px'}
          justifyContent='flex-end'
        >
          <Text {...paragraphMedium}>USDC</Text>
        </InputRightElement>
      </InputGroup>
      <HStack
        mt={isMobile ? '32px' : '24px'}
        gap={isMobile ? '16px' : '8px'}
        flexDir={isMobile ? 'column' : 'row'}
      >
        {actionButton}
        {!+displayAmount && splitSharesMutation.status === 'idle' && (
          <Text {...paragraphRegular} color='grey.500'>
            Enter amount
          </Text>
        )}
        {splitSharesMutation.isPending && (
          <Text {...paragraphRegular} color='grey.500'>
            Processing transaction...
          </Text>
        )}
      </HStack>
    </Box>
  )

  return isMobile ? (
    modalContent
  ) : (
    <Modal isOpen={isOpen} onClose={onClose} title='Split shares' h={'unset'} mt={'auto'}>
      {modalContent}
    </Modal>
  )
}
