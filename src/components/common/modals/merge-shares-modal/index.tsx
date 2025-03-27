import { Box, Button, HStack, InputGroup, Text } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { isMobile, isTablet } from 'react-device-detect'
import { Address, formatUnits, parseUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import { Modal } from '@/components/common/modals/modal'
import NumberInputWithButtons from '@/components/common/number-input-with-buttons'
import { ClickEvent, useAccount, useAmplitude, useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphBold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface MergeSharesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MergeSharesModal({ isOpen, onClose }: MergeSharesModalProps) {
  const [displayAmount, setDisplayAmount] = useState('')
  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [modalHeight, setModalHeight] = useState(0)
  const { market } = useTradingService()
  const { checkAllowanceForAll, client, approveAllowanceForAll, mergeShares } = useWeb3Service()
  const { web3Wallet } = useAccount()
  const queryClient = useQueryClient()
  const { trackClicked } = useAmplitude()
  const { sharesAvailable } = useClobWidget()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const sharesAvailableBalance = useMemo(() => {
    if (!sharesAvailable) {
      return '0'
    }
    return new BigNumber(sharesAvailable['yes'].toString()).isGreaterThanOrEqualTo(
      new BigNumber(sharesAvailable['no'].toString())
    )
      ? formatUnits(sharesAvailable['no'], market?.collateralToken.decimals || 6)
      : formatUnits(sharesAvailable['yes'], market?.collateralToken.decimals || 6)
  }, [sharesAvailable, market?.collateralToken.decimals])

  const isExceedsBalance = useMemo(() => {
    if (+displayAmount && sharesAvailableBalance) {
      return +displayAmount > +sharesAvailableBalance
    }
    return false
  }, [displayAmount, sharesAvailableBalance])

  const handleAmountChange = (value: string) => {
    setDisplayAmount(value)
  }

  const handleMergeClicked = async () => {
    trackClicked(ClickEvent.MergeSharesConfirmed, {
      marketAddress: market?.slug,
      value: displayAmount,
    })
    await mergeSharesMutation.mutateAsync({
      amount: displayAmount,
      decimals: market?.collateralToken.decimals || 6,
      conditionId: market?.conditionId as string,
      contractAddress: market?.collateralToken.address as Address,
    })
  }

  const handleFocus = () => {
    if ((isMobile || isTablet) && inputRef.current) {
      setModalHeight(612)
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
  }

  const handleBlur = () => {
    if ((isMobile || isTablet) && inputRef.current) {
      setModalHeight(0)
    }
  }

  const checkMergeAllowance = async () => {
    const operator = market?.negRiskRequestId
      ? process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
      : process.env.NEXT_PUBLIC_CTF_CONTRACT
    const isApproved = await checkAllowanceForAll(
      operator as Address,
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
    )
    setIsApproved(isApproved)
  }

  const onResetAfterMerge = async () => {
    await sleep(1)
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug, market?.tokens],
    })
    await queryClient.refetchQueries({
      queryKey: ['positions'],
    })
    mergeSharesMutation.reset()
  }

  const mergeSharesMutation = useMutation({
    mutationFn: async ({
      amount,
      decimals,
      conditionId,
      contractAddress,
    }: {
      amount: string
      decimals: number
      contractAddress: Address
      conditionId: string
    }) => {
      try {
        const value = parseUnits(amount, decimals)
        await mergeShares(
          contractAddress,
          conditionId,
          value,
          market?.negRiskRequestId ? 'negrisk' : 'common'
        )
      } catch (e) {
        // @ts-ignore
        throw new Error(e)
      }
    },
  })

  const isLowerThanMinAmount = useMemo(() => {
    if (+displayAmount && mergeSharesMutation.status === 'idle') {
      return +displayAmount < 1
    }
    return false
  }, [displayAmount, mergeSharesMutation.status])

  const approveContractMutation = useMutation({
    mutationFn: async () => {
      const operator = market?.negRiskRequestId
        ? process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
        : process.env.NEXT_PUBLIC_CTF_CONTRACT
      await approveAllowanceForAll(
        operator as Address,
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
      )
    },
  })

  const onResetAfterApprove = async () => {
    await sleep(1)
    await checkMergeAllowance()
    approveContractMutation.reset()
  }

  const handleMaxClicked = () => {
    trackClicked(ClickEvent.MergeSharesModalMaxSharesClicked, {
      marketAddress: market?.slug,
    })
    setDisplayAmount(sharesAvailableBalance)
  }

  const actionButton = useMemo(() => {
    if (client === 'etherspot') {
      return (
        <ButtonWithStates
          variant='contained'
          w={isMobile ? 'full' : '94px'}
          isDisabled={!+displayAmount || isExceedsBalance || isLowerThanMinAmount}
          onClick={handleMergeClicked}
          status={mergeSharesMutation.status}
          onReset={onResetAfterMerge}
        >
          Merge
        </ButtonWithStates>
      )
    }
    if (!isApproved) {
      return (
        <ButtonWithStates
          variant='contained'
          w={isMobile ? 'full' : '94px'}
          isDisabled={!+displayAmount || isExceedsBalance || isLowerThanMinAmount}
          onClick={() => approveContractMutation.mutateAsync()}
          status={approveContractMutation.status}
          onReset={onResetAfterApprove}
        >
          Approve
        </ButtonWithStates>
      )
    }
    return (
      <ButtonWithStates
        variant='contained'
        w={isMobile ? 'full' : '94px'}
        isDisabled={!+displayAmount || isExceedsBalance || isLowerThanMinAmount}
        onClick={handleMergeClicked}
        status={mergeSharesMutation.status}
        onReset={onResetAfterMerge}
      >
        Merge
      </ButtonWithStates>
    )
  }, [
    isApproved,
    approveContractMutation,
    client,
    displayAmount,
    isExceedsBalance,
    market?.collateralToken.decimals,
    mergeSharesMutation.status,
    onResetAfterMerge,
  ])

  useEffect(() => {
    if (market && web3Wallet) {
      checkMergeAllowance()
    }
  }, [market, web3Wallet])

  const modalContent = (
    <Box h={modalHeight ? `${modalHeight}px` : 'unset'}>
      <Text {...paragraphBold} mt='24px'>
        Combine equal amounts of &quot;Yes&quot; and &quot;No&quot; shares to reclaim USDC.
      </Text>
      <Text {...paragraphRegular} mt='8px'>
        Use this to simplify your holdings and reduce costs when closing a position.
      </Text>
      <InputGroup display='block' mt='16px'>
        <HStack justifyContent='space-between' mb='8px'>
          <Text {...paragraphMedium} color='grey.500'>
            Enter Amount
          </Text>
          <Button
            {...paragraphRegular}
            p='0'
            borderRadius='0'
            minW='unset'
            h='auto'
            variant='plain'
            onClick={handleMaxClicked}
            color='grey.500'
            borderBottom='1px dotted'
            borderColor='rgba(132, 132, 132, 0.5)'
            _hover={{
              borderColor: 'grey.600',
              color: 'grey.600',
            }}
          >
            Available: {sharesAvailableBalance}
          </Button>
        </HStack>
        <NumberInputWithButtons
          value={displayAmount}
          isInvalid={isExceedsBalance}
          handleInputChange={handleAmountChange}
          showIncrements={false}
          inputType='number'
          endAdornment={<Text {...paragraphMedium}>Contracts</Text>}
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </InputGroup>
      <HStack
        mt={isMobile ? '32px' : '24px'}
        gap={isMobile ? '16px' : '8px'}
        flexDir={isMobile ? 'column' : 'row'}
      >
        {actionButton}
        {!+displayAmount && mergeSharesMutation.status === 'idle' && (
          <Text {...paragraphRegular} color='grey.500'>
            Enter amount
          </Text>
        )}
        {isLowerThanMinAmount && (
          <Text {...paragraphRegular} color='grey.500'>
            Min. amount is 1
          </Text>
        )}
        {mergeSharesMutation.isPending && (
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
    <Modal isOpen={isOpen} onClose={onClose} title='Merge Contracts' h={'unset'} mt={'auto'}>
      {modalContent}
    </Modal>
  )
}
