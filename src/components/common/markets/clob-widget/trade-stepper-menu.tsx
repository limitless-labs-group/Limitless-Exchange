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
import React, { useEffect, useMemo } from 'react'
import { Address, maxUint256, parseUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import Paper from '@/components/common/paper'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import usePrivySendTransaction from '@/hooks/use-smart-wallet-service'
import CloseIcon from '@/resources/icons/close-icon.svg'
import CompletedStepIcon from '@/resources/icons/completed-icon.svg'
import LockerIcon from '@/resources/icons/locker-icon.svg'
import { useAccount, useTradingService } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
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
  } = useClobWidget()
  const { strategy, market, clobOutcome: outcome } = useTradingService()
  const { approveContract, approveAllowanceForAll } = useWeb3Service()
  const queryClient = useQueryClient()
  const { web3Client, profileData } = useAccount()
  const privyService = usePrivySendTransaction()
  const { placeLimitOrder, placeMarketOrder } = useWeb3Service()
  const privateClient = useAxiosPrivateClient()
  const toast = useToast()

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
      : `You’re selling ${outcomeToken} shares for ${NumberUtil.formatThousands(
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
    mutationKey: ['approve', market?.slug],
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
    mutationKey: ['approve-nft', market?.slug],
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

  const placeMarketOrderMutation = useMutation({
    mutationKey: ['market-order', market?.slug, price],
    mutationFn: async () => {
      if (market) {
        if (web3Client === 'etherspot') {
          if (strategy === 'Sell') {
            await privyService.approveConditionalIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
            )
          } else {
            await privyService.approveCollateralIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              maxUint256,
              market?.collateralToken.address as Address
            )
          }
        }
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeMarketOrder(
          tokenId,
          market.collateralToken.decimals,
          outcome === 0 ? yesPrice.toString() : noPrice.toString(),
          side,
          price
        )
        const data = {
          order: {
            ...signedOrder,
            salt: +signedOrder.salt,
            price: undefined,
            makerAmount: +parseUnits(price, market.collateralToken.decimals).toString(),
            takerAmount: +signedOrder.takerAmount,
            nonce: +signedOrder.nonce,
            feeRateBps: +signedOrder.feeRateBps,
          },
          ownerId: profileData?.id,
          orderType: 'FOK',
          marketSlug: market.slug,
        }
        return privateClient.post('/orders', data)
      }
    },
    onError: async () => {
      const id = toast({
        render: () => <Toast title={'Oops... Something went wrong'} id={id} />,
      })
      await queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      })
    },
  })

  const placeLimitOrderMutation = useMutation({
    mutationKey: ['limit-order', market?.slug, price],
    mutationFn: async () => {
      if (market) {
        if (web3Client === 'etherspot') {
          if (strategy === 'Sell') {
            await privyService.approveConditionalIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
            )
          } else {
            await privyService.approveCollateralIfNeeded(
              process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
              maxUint256,
              market?.collateralToken.address as Address
            )
          }
        }
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeLimitOrder(
          tokenId,
          market.collateralToken.decimals,
          price,
          sharesAmount,
          side
        )
        const data = {
          order: {
            ...signedOrder,
            salt: +signedOrder.salt,
            price: new BigNumber(price).dividedBy(100).toNumber(),
            makerAmount: +signedOrder.makerAmount,
            takerAmount: +signedOrder.takerAmount,
            nonce: +signedOrder.nonce,
            feeRateBps: +signedOrder.feeRateBps,
          },
          ownerId: profileData?.id,
          orderType: 'GTC',
          marketSlug: market.slug,
        }
        return privateClient.post('/orders', data)
      }
    },
    onError: async () => {
      const id = toast({
        render: () => <Toast title={'Oops... Something went wrong'} id={id} />,
      })
      await queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      })
    },
  })

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
    await sleep(2)
    setActiveStep(3)
    await queryClient.refetchQueries({
      queryKey: ['user-orders', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['order-book', market?.slug],
    })
  }

  const renderTradeButton = () => {
    return (
      <ButtonWithStates
        status={tradeMutation.status}
        variant='contained'
        onClick={async () => {
          await tradeMutation.mutateAsync()
          await sleep(2)
        }}
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

  const closeModalWithDelay = async () => {
    await sleep(5)
    tradeMutation.reset()
    onToggleTradeStepper()
  }

  const headerText =
    strategy === 'Buy'
      ? 'Just authorize the needed USDC for this trade then sign the transaction to confirm'
      : 'Just authorize permission for sell then sign the transaction to confirm'

  useEffect(() => {
    if (activeStep === 3) {
      closeModalWithDelay()
    }
  }, [activeStep])

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
