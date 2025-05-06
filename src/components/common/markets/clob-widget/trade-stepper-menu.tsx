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
import { AxiosError } from 'axios'
import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo } from 'react'
import ButtonWithStates from 'src/components/common/buttons/button-with-states'
import { Address, maxUint256, parseUnits } from 'viem'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import Paper from '@/components/common/paper'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import CloseIcon from '@/resources/icons/close-icon.svg'
import CompletedStepIcon from '@/resources/icons/completed-icon.svg'
import LockerIcon from '@/resources/icons/locker-icon.svg'
import { ClickEvent, useAccount, useAmplitude, useTradingService } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useWeb3Service } from '@/services/Web3Service'
import { h3Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketOrderType } from '@/types'
import { NumberUtil } from '@/utils'
import { getOrderErrorText } from '@/utils/orders'

export default function TradeStepperMenu() {
  const {
    onToggleTradeStepper,
    orderType,
    yesPrice,
    noPrice,
    price,
    sharesAmount,
    isApprovedNegRiskForSell,
    checkMarketAllowance,
  } = useClobWidget()
  const { strategy, market, clobOutcome: outcome } = useTradingService()
  const { approveContract, approveAllowanceForAll } = useWeb3Service()
  const queryClient = useQueryClient()
  const { web3Client, profileData } = useAccount()
  const { placeLimitOrder, placeMarketOrder } = useWeb3Service()
  const privateClient = useAxiosPrivateClient()
  const toast = useToast()
  const { trackClicked } = useAmplitude()

  const firstStepMessage = useMemo(() => {
    const outcomePrice = price
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
    outcome,
    noPrice,
    yesPrice,
    price,
    sharesAmount,
    market?.collateralToken.symbol,
    strategy,
    orderType,
  ])

  const secondStepMessage = useMemo(() => {
    return strategy === 'Buy'
      ? `Unlock wallet to trade using ${market?.collateralToken.symbol}`
      : `Unlock wallet to trade your shares`
  }, [market?.collateralToken.symbol, strategy])

  const thirdStepMessage = useMemo(() => {
    return strategy === 'Sell' && !isApprovedNegRiskForSell && market?.negRiskRequestId
      ? 'Unlock wallet to trade your shares'
      : null
  }, [strategy, market?.negRiskRequestId])

  const fourthStepMessage = useMemo(() => {
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
        const spender = market.negRiskRequestId
          ? process.env.NEXT_PUBLIC_NEGRISK_CTF_EXCHANGE
          : process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR
        await approveContract(spender as Address, market.collateralToken.address, maxUint256)
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
        const operator = market.negRiskRequestId
          ? process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
          : process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR
        await approveAllowanceForAll(
          operator as Address,
          process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
        )
      }
    },
    onError: () => {
      approveForSellMutation.reset()
    },
  })

  const approveMutation = strategy === 'Buy' ? approveBuyMutation : approveForSellMutation

  const approveSellNegRiskMutation = useMutation({
    mutationKey: ['approve-negrisk'],
    mutationFn: async () => {
      if (market) {
        await approveAllowanceForAll(
          process.env.NEXT_PUBLIC_NEGRISK_CTF_EXCHANGE as Address,
          process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
        )
      }
    },
  })

  const placeMarketOrderMutation = useMutation({
    mutationKey: ['market-order', market?.slug, price],
    mutationFn: async () => {
      trackClicked(ClickEvent.ConfirmTransactionClicked, {
        address: market?.slug,
        outcome: outcome,
        strategy,
        walletType: web3Client,
        marketType: market?.marketType,
        marketMakerType: 'ClOB',
        tradingMode: 'market order',
      })
      if (market) {
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeMarketOrder(
          tokenId,
          market.collateralToken.decimals,
          outcome === 0 ? yesPrice.toString() : noPrice.toString(),
          side,
          price,
          market.negRiskRequestId ? 'negRisk' : 'common'
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
    onError: async (error: AxiosError<{ message: string }>) => {
      const id = toast({
        render: () => (
          <Toast title={getOrderErrorText(error.response?.data.message ?? '')} id={id} />
        ),
      })
      await queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      })
    },
  })

  const placeLimitOrderMutation = useMutation({
    mutationKey: ['limit-order', market?.slug, price],
    mutationFn: async () => {
      trackClicked(ClickEvent.ConfirmTransactionClicked, {
        address: market?.slug,
        outcome: outcome,
        strategy,
        walletType: web3Client,
        marketType: market?.marketType,
        marketMakerType: 'ClOB',
        tradingMode: 'limit order',
      })
      if (market) {
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeLimitOrder(
          tokenId,
          market.collateralToken.decimals,
          price,
          sharesAmount,
          side,
          market.negRiskRequestId ? 'negRisk' : 'common'
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
    onError: async (error: AxiosError<{ message: string }>) => {
      const id = toast({
        render: () => (
          <Toast title={getOrderErrorText(error.response?.data.message ?? '')} id={id} />
        ),
      })
      await queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      })
    },
  })

  const tradeMutation =
    orderType === MarketOrderType.MARKET ? placeMarketOrderMutation : placeLimitOrderMutation

  const onResetApproveMutation = async () => {
    await sleep(1)
    setActiveStep(activeStep + 1)
    !thirdStepMessage && (await checkMarketAllowance())
    approveMutation.reset()
  }

  const onResetNegRiskApproveMutation = async () => {
    await sleep(1)
    setActiveStep(activeStep + 1)
    await checkMarketAllowance()
    approveSellNegRiskMutation.reset()
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

  const renderNegriskApproveButton = () => {
    return (
      <ButtonWithStates
        status={approveSellNegRiskMutation.status}
        variant='contained'
        onClick={async () => approveSellNegRiskMutation.mutateAsync()}
        onReset={onResetNegRiskApproveMutation}
        w='100px'
      >
        Unlock
      </ButtonWithStates>
    )
  }

  const onResetTradeMutation = async () => {
    await sleep(1)
    setActiveStep(activeStep + 1)
    await Promise.allSettled([
      queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['market-shares', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['order-book', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['locked-balance', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['prices', market?.slug],
      }),
    ])
  }

  const renderTradeButton = () => {
    return (
      <ButtonWithStates
        status={tradeMutation.status}
        variant='contained'
        onClick={async () => {
          await tradeMutation.mutateAsync()
          await sleep(1)
        }}
        onReset={onResetTradeMutation}
        w='100px'
      >
        Sign
      </ButtonWithStates>
    )
  }

  const commonSteps = [
    { title: firstStepMessage },
    { title: secondStepMessage, button: renderApproveButton() },
    { title: fourthStepMessage, button: renderTradeButton() },
  ]

  const steps = thirdStepMessage
    ? [
        ...commonSteps.slice(0, 2),
        {
          title: thirdStepMessage,
          button: renderNegriskApproveButton(),
        },
        commonSteps.at(-1),
      ]
    : commonSteps

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
    if (activeStep === steps.length) {
      closeModalWithDelay()
    }
  }, [activeStep, steps.length])

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
              <StepTitle>{step?.title}</StepTitle>
              {activeStep === index ? step?.button : null}
            </HStack>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>
    </Paper>
  )
}
