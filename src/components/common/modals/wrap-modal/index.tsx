import { Box, HStack, InputGroup, Text, Input, InputRightElement, Button } from '@chakra-ui/react'
import { useBalanceService } from '@/services'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Modal } from '@/components/common/modals/modal'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import AmountSlider from '@/components/common/amount-slider'
import ButtonWithStates from '@/components/common/button-with-states'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import SwapIcon from '@/resources/icons/swap-icon.svg'
import { useQueryClient } from '@tanstack/react-query'

interface WrapModalPros {
  isOpen: boolean
  onClose: () => void
}

export default function WrapModal({ isOpen, onClose }: WrapModalPros) {
  const queryClient = useQueryClient()
  const [displayAmount, setDisplayAmount] = useState('')
  const [sliderValue, setSliderValue] = useState(0)
  const { ethBalance, wrapMutation, unwrapMutation, balanceOfSmartWallet } = useBalanceService()
  const [tokenFrom, setTokenFrom] = useState<'ETH' | 'WETH'>('ETH')
  const [tokenTo, setTokenTo] = useState<'ETH' | 'WETH'>('WETH')

  const wethBalance =
    balanceOfSmartWallet?.find((balanceItem) => balanceItem.symbol === 'WETH')?.formatted || '0.00'
  const etherBalance = ethBalance || '0.00'

  const balanceFrom = useMemo(() => {
    return tokenFrom === 'ETH' ? etherBalance : wethBalance || '0.00'
  }, [tokenFrom, etherBalance, wethBalance])

  const isExceedsBalance = useMemo(() => {
    if (+displayAmount && balanceFrom) {
      return +displayAmount > +balanceFrom
    }
    return false
  }, [displayAmount, balanceFrom])

  const mutationToCall = tokenFrom === 'ETH' ? wrapMutation : unwrapMutation

  const onSlide = useCallback(
    (value: number) => {
      setSliderValue(value)
      if (value == 0 || !balanceFrom) {
        setDisplayAmount('')
        return
      }
      if (value == 100) {
        setDisplayAmount(NumberUtil.toFixed(balanceFrom, 6))
        return
      }
      const amountByPercent = (Number(balanceFrom) * value) / 100
      setDisplayAmount(NumberUtil.toFixed(amountByPercent, 6))
    },
    [balanceFrom]
  )

  const handleAmountChange = (value: string) => {
    setDisplayAmount(value)
    const amountByPercent = (+value / Number(balanceFrom)) * 100
    const sliderValue = amountByPercent > 100 ? 100 : amountByPercent.toFixed()
    setSliderValue(+sliderValue)
  }

  const handleWrap = async () => {
    await mutationToCall.mutateAsync(displayAmount)
  }

  const resetMutation = async () => {
    await sleep(2)
    setDisplayAmount('')
    setSliderValue(0)
    await queryClient.refetchQueries({ queryKey: ['ethBalance'] })
    mutationToCall.reset()
  }

  const handleSwapButtonClicked = () => {
    const amountByPercent =
      tokenTo === 'WETH' ? +displayAmount / +wethBalance : +displayAmount / +etherBalance
    setSliderValue(+(amountByPercent * 100).toFixed())
    setTokenFrom(tokenTo)
    setTokenTo(tokenFrom)
    return
  }

  useEffect(() => {
    if (mutationToCall.status === 'success') {
      resetMutation()
    }
  }, [mutationToCall.status])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Wrap ETH'>
      <HStack justifyContent='space-between' mt={isMobile ? '32px' : '24px'}>
        <Text {...paragraphMedium}>Balance</Text>
        <Text {...paragraphMedium}>
          {NumberUtil.formatThousands(balanceFrom, 6)} {tokenFrom}
        </Text>
      </HStack>
      <Box my='12px' ml={isMobile ? '4px' : 0}>
        <AmountSlider
          variant='base'
          value={sliderValue}
          disabled={!+balanceFrom}
          onSlide={onSlide}
        />
      </Box>
      <InputGroup display='block'>
        <HStack justifyContent='space-between' mb='4px'>
          <Text {...paragraphMedium}>Sell</Text>
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
          top={isMobile ? '32px' : '28px'}
          right={isMobile ? '12px' : '8px'}
          justifyContent='flex-end'
        >
          <Text {...paragraphMedium}>{tokenFrom}</Text>
        </InputRightElement>
      </InputGroup>
      <HStack justifyContent='center' mt={isMobile ? '28px' : '20px'}>
        <Button
          variant='grey'
          sx={{ transform: 'rotate(90deg)' }}
          p='8px 4px'
          minW='24px'
          minH='32px'
          onClick={handleSwapButtonClicked}
        >
          <SwapIcon width={16} height={16} />
        </Button>
      </HStack>
      <InputGroup display='block'>
        <Text {...paragraphMedium} mb='4px'>
          Buy
        </Text>
        <Input
          variant='grey'
          value={displayAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder='0'
          type='number'
        />
        <InputRightElement
          h='16px'
          top={isMobile ? '32px' : '28px'}
          right={isMobile ? '12px' : '8px'}
          justifyContent='flex-end'
        >
          <Text {...paragraphMedium}>{tokenTo}</Text>
        </InputRightElement>
      </InputGroup>
      <HStack
        mt={isMobile ? '32px' : '24px'}
        gap={isMobile ? '16px' : '8px'}
        flexDir={isMobile ? 'column' : 'row'}
      >
        <ButtonWithStates
          variant='contained'
          w={isMobile ? 'full' : '94px'}
          isDisabled={!+displayAmount || isExceedsBalance}
          onClick={handleWrap}
          status={mutationToCall.status}
        >
          {tokenFrom === 'ETH' ? 'Wrap' : 'Unwrap'}
        </ButtonWithStates>
        {!+displayAmount && mutationToCall.status === 'idle' && (
          <Text {...paragraphRegular} color='grey.500'>
            Enter amount
          </Text>
        )}
        {mutationToCall.isPending && (
          <Text {...paragraphRegular} color='grey.500'>
            Processing transaction...
          </Text>
        )}
      </HStack>
    </Modal>
  )
}
