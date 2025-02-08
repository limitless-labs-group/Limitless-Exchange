import {
  Box,
  Button,
  HStack,
  Step,
  StepIndicator,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Text,
  useSteps,
} from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'
import { Address, maxUint256 } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import Paper from '@/components/common/paper'
import CloseIcon from '@/resources/icons/close-icon.svg'
import CompletedStepIcon from '@/resources/icons/completed-icon.svg'
import LockerIcon from '@/resources/icons/locker-icon.svg'
import { useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { h3Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketOrderType } from '@/types'
import { NumberUtil } from '@/utils'

export default function TradeStepperMenu() {
  const {
    onToggleTradeStepper,
    orderType,
    yesPrice,
    noPrice,
    price,
    sharesAmount,
    checkMarketAllowance,
    placeMarketOrderMutation,
    placeLimitOrderMutation,
  } = useClobWidget()
  const { strategy, market, clobOutcome: outcome } = useTradingService()
  const { approveContract, approveAllowanceForAll } = useWeb3Service()
  const queryClient = useQueryClient()

  const firstStepMessage = useMemo(() => {
    const outcomePrice = outcome ? noPrice : yesPrice
    const totalPrice = new BigNumber(price).multipliedBy(sharesAmount).dividedBy(100).toString()
    const outcomeToken = outcome ? 'No' : 'Yes'
    const collateral = market?.collateralToken.symbol
    if (strategy === 'Buy') {
      return orderType === MarketOrderType.MARKET
        ? `You’re buying ${outcomeToken} shares for ${NumberUtil.formatThousands(
            price,
            2
          )} ${collateral}`
        : `You’re buying ${outcomeToken} ${outcomePrice}% for ${NumberUtil.formatThousands(
            totalPrice,
            2
          )} ${collateral}`
    }
    return orderType === MarketOrderType.MARKET
      ? `You’re selling ${outcomeToken} shares for market price`
      : `You’re selling ${outcomeToken} ${outcomePrice}% for ${NumberUtil.formatThousands(
          totalPrice,
          2
        )} ${collateral}`
  }, [
    noPrice,
    orderType,
    outcome,
    price,
    sharesAmount,
    strategy,
    yesPrice,
    market?.collateralToken.symbol,
  ])

  const secondStepMessage = useMemo(() => {
    return strategy === 'Buy'
      ? `Unlock wallet to trade using ${market?.collateralToken.symbol}`
      : `Unlock wallet to trade your shares`
  }, [market?.collateralToken.symbol, strategy])

  const thirdMessage = useMemo(() => {
    const totalPrice = new BigNumber(price).multipliedBy(sharesAmount).dividedBy(100).toString()
    if (strategy === 'Buy') {
      return orderType === MarketOrderType.MARKET
        ? `Sign transaction for ${NumberUtil.formatThousands(price, 2)} USDC`
        : `Sign transaction for ${NumberUtil.formatThousands(totalPrice, 2)} USDC`
    }
    return `Sign transaction for sell ${NumberUtil.formatThousands(sharesAmount, 6)} shares`
  }, [orderType, price, sharesAmount, strategy])

  const approveBuyMutation = useMutation({
    mutationKey: ['approve', market?.address],
    mutationFn: async () => {
      if (market) {
        await approveContract(
          process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
          market.collateralToken.address,
          maxUint256
        )
      }
    },
    onError: () => {
      approveBuyMutation.reset()
    },
  })

  const approveForSellMutation = useMutation({
    mutationKey: ['approve-nft', market?.address],
    mutationFn: async () => {
      if (market) {
        await approveAllowanceForAll(
          process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
          process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
        )
      }
    },
    onError: () => {
      approveForSellMutation.reset()
    },
  })

  const approveMutation = strategy === 'Buy' ? approveBuyMutation : approveForSellMutation

  const tradeMutation =
    orderType === MarketOrderType.MARKET ? placeMarketOrderMutation : placeLimitOrderMutation

  const onResetApproveMutation = async () => {
    await sleep(2)
    await checkMarketAllowance()
    setActiveStep(2)
    approveMutation.reset()
  }

  const renderApproveButton = () => {
    return (
      <ButtonWithStates
        status={approveMutation.status}
        variant='contained'
        onClick={async () => approveMutation.mutateAsync()}
        onReset={onResetApproveMutation}
        w='100px'
      >
        Unlock
      </ButtonWithStates>
    )
  }

  const onResetTradeMutation = async () => {
    await queryClient.refetchQueries({
      queryKey: ['user-orders', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['order-book', market?.slug],
    })
    tradeMutation.reset()
    setActiveStep(3)
  }

  const renderTradeButton = () => {
    return (
      <ButtonWithStates
        status={tradeMutation.status}
        variant='contained'
        onClick={async () => tradeMutation.mutateAsync()}
        onReset={onResetTradeMutation}
        w='100px'
      >
        Sign
      </ButtonWithStates>
    )
  }

  const steps = [
    { title: firstStepMessage },
    { title: secondStepMessage, button: renderApproveButton() },
    { title: thirdMessage, button: renderTradeButton() },
  ]

  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: steps.length + 1,
  })

  const headerText =
    strategy === 'Buy'
      ? 'Just authorize the needed USDC for this trade then sign the transaction to confirm'
      : 'Just authorize permission for sell then sign the transaction to confirm'

  return (
    <Paper position='absolute' bottom={0} rounded='8px' zIndex={100} w='full' p='16px' pt='8px'>
      <HStack w='full' justifyContent='center'>
        <Button variant='transparentGreyText' onClick={onToggleTradeStepper}>
          <CloseIcon width={16} height={16} />
          Close
        </Button>
      </HStack>
      <HStack w='full' gap='8px' alignItems='flex-start' mt='16px'>
        <Box>
          <Text {...h3Bold}>Almost There!</Text>
          <Text {...paragraphRegular} color='grey.500'>
            {headerText}
          </Text>
        </Box>
        <Box minW='56px'>
          <LockerIcon />
        </Box>
      </HStack>
      <Stepper index={activeStep} orientation='vertical' gap='16px' mt='32px'>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={
                  <Box color='grey.400' zIndex={10}>
                    <CompletedStepIcon />
                  </Box>
                }
                incomplete={
                  <Box
                    bg='grey.100'
                    w='16px'
                    h='16px'
                    rounded='full'
                    border='2px solid'
                    borderColor='grey.400'
                    zIndex={10}
                  />
                }
                active={
                  <Box color='grey.800' zIndex={10}>
                    <CompletedStepIcon />
                  </Box>
                }
              />
            </StepIndicator>

            <HStack w='full' justifyContent='space-between'>
              <StepTitle>{step.title}</StepTitle>
              {activeStep === index ? step.button : null}
            </HStack>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
    </Paper>
  )
}
