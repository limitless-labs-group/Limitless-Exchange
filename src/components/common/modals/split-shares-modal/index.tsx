import { Box, Button, Flex, HStack, InputGroup, Text } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { isMobile, isTablet } from 'react-device-detect'
import { Address, maxUint256, parseUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import { Modal } from '@/components/common/modals/modal'
import NumberInputWithButtons from '@/components/common/number-input-with-buttons'
import TradeWidgetSkeleton, {
  SkeletonType,
} from '@/components/common/skeleton/trade-widget-skeleton'
import {
  ClickEvent,
  useAccount,
  useAmplitude,
  useBalanceQuery,
  useBalanceService,
  useTradingService,
} from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphBold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface SplitSharesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SplitSharesModal({ isOpen, onClose }: SplitSharesModalProps) {
  const [displayAmount, setDisplayAmount] = useState('')
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [modalHeight, setModalHeight] = useState(0)
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { market } = useTradingService()
  const { checkAllowance, client, approveContract, splitShares } = useWeb3Service()
  const { trackClicked } = useAmplitude()
  const { balance } = useClobWidget()
  const { balanceLoading } = useBalanceService()
  const { web3Wallet } = useAccount()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement | null>(null)

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

  const handleSplitClicked = async () => {
    trackClicked(ClickEvent.SplitSharesConfirmed, {
      marketAddress: market?.slug,
      value: displayAmount,
    })
    await splitSharesMutation.mutateAsync({
      amount: displayAmount,
      decimals: market?.collateralToken.decimals || 6,
      conditionId: market?.conditionId as string,
      contractAddress: market?.collateralToken.address as Address,
    })
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug],
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
    if (modalHeight) {
      setModalHeight(0)
    }
  }

  const checkSplitAllowance = async () => {
    const allowance = await checkAllowance(
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
      market?.collateralToken.address as Address
    )
    setAllowance(allowance)
  }

  const onResetAfterSplit = async () => {
    await sleep(3)
    await checkSplitAllowance()
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug, market?.tokens],
    })
    setDisplayAmount('')
    splitSharesMutation.reset()
  }

  const handlePercentButtonClicked = (value: number) => {
    trackClicked(ClickEvent.SplitSharesAmountPercentClicked, {
      amount: value,
      marketAddress: market?.slug,
      marketType: market?.marketType,
      marketTags: market?.tags,
    })
    if (value === 100) {
      setDisplayAmount(balance)
      return
    }
    const amountByPercent = (Number(balance) * value) / 100
    setDisplayAmount(
      NumberUtil.toFixed(amountByPercent, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
    )
    return
  }

  const splitSharesMutation = useMutation({
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
        await splitShares(contractAddress, conditionId, value)
      } catch (e) {
        // @ts-ignore
        throw new Error(e)
      }
    },
  })

  const approveContractMutation = useMutation({
    mutationFn: async () => {
      await approveContract(
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
        market?.collateralToken.address as Address,
        maxUint256
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
          onReset={onResetAfterSplit}
        >
          Split
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
        onReset={onResetAfterSplit}
      >
        Split
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
    onResetAfterSplit,
  ])

  const renderButtonContent = (title: number) => {
    if (title === 100) {
      if (isMobile) {
        return 'MAX'
      }
      const balanceToShow = NumberUtil.formatThousands(
        balance,
        market?.collateralToken.symbol === 'USDC' ? 1 : 6
      )
      return `${
        balanceLoading ? (
          <Box w='90px'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        ) : (
          balanceToShow
        )
      }`
    }
    return `${title}%`
  }

  const showBalanceWithButtons = useMemo(() => {
    return (
      <Flex gap='8px'>
        {[10, 25, 50, 100].map((title: number) => (
          <Button
            {...paragraphRegular}
            p='0'
            borderRadius='0'
            minW='unset'
            h='auto'
            variant='plain'
            key={title}
            flex={1}
            onClick={() => handlePercentButtonClicked(title)}
            color='grey.500'
            borderBottom='1px dotted'
            borderColor='rgba(132, 132, 132, 0.5)'
            _hover={{
              borderColor: 'var(--chakra-colors-text-100)',
              color: 'var(--chakra-colors-text-100)',
            }}
            disabled={balanceLoading}
          >
            {renderButtonContent(title)}
          </Button>
        ))}
      </Flex>
    )
  }, [balanceLoading, balance])

  useEffect(() => {
    if (market && web3Wallet) {
      checkSplitAllowance()
    }
  }, [market, web3Wallet])

  const modalContent = (
    <Box marginBottom={modalHeight ? `${modalHeight}px` : 'unset'}>
      <Text {...paragraphBold} mt='24px'>
        Turn your USDC into an equal number of &quot;Yes&quot; and &quot;No&quot; Contracts.
      </Text>
      <Text {...paragraphRegular} mt='8px'>
        This lets you reduce costs by holding both sides of the position—sell the side you don’t
        want.
      </Text>
      <InputGroup display='block' mt='16px'>
        <HStack justifyContent='space-between' mb='8px'>
          <Text {...paragraphMedium}>Enter Amount</Text>
          {showBalanceWithButtons}
        </HStack>
        <NumberInputWithButtons
          value={displayAmount}
          isInvalid={isExceedsBalance}
          handleInputChange={handleAmountChange}
          showIncrements={false}
          inputType='number'
          endAdornment={<Text {...paragraphMedium}>USDC</Text>}
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
    <Modal isOpen={isOpen} onClose={onClose} title='Split Contracts' h={'unset'} mt={'auto'}>
      {modalContent}
    </Modal>
  )
}
