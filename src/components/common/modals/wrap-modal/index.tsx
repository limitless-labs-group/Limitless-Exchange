import { Box, HStack, InputGroup, Text, Input, InputRightElement } from '@chakra-ui/react'
import { useBalanceService } from '@/services'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Modal } from '@/components/common/modals/modal'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import AmountSlider from '@/components/common/amount-slider'
import ButtonWithStates from '@/components/common/button-with-states'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'

interface WrapModalPros {
  isOpen: boolean
  onClose: () => void
}

export default function WrapModal({ isOpen, onClose }: WrapModalPros) {
  const [displayAmount, setDisplayAmount] = useState('')
  const [sliderValue, setSliderValue] = useState(0)
  const { ethBalance, wrapMutation } = useBalanceService()

  const isExceedsBalance = useMemo(() => {
    if (+displayAmount && ethBalance) {
      return +displayAmount > +ethBalance
    }
    return false
  }, [displayAmount, ethBalance])

  const onSlide = useCallback(
    (value: number) => {
      setSliderValue(value)
      if (value == 0 || !ethBalance) {
        setDisplayAmount('')
        return
      }
      if (value == 100) {
        setDisplayAmount(NumberUtil.toFixed(ethBalance, 6))
        return
      }
      const amountByPercent = (Number(ethBalance) * value) / 100
      setDisplayAmount(NumberUtil.toFixed(amountByPercent, 6))
    },
    [ethBalance, displayAmount]
  )

  const handleAmountChange = (value: string) => {
    setDisplayAmount(value)
    const amountByPercent = (+value / Number(ethBalance)) * 100
    const sliderValue = amountByPercent > 100 ? 100 : amountByPercent.toFixed()
    setSliderValue(+sliderValue)
  }

  const handleWrap = async () => {
    await wrapMutation.mutateAsync(displayAmount)
  }

  const resetMutation = async () => {
    await sleep(2)
    setDisplayAmount('')
    wrapMutation.reset()
  }

  useEffect(() => {
    if (wrapMutation.status === 'success') {
      resetMutation()
    }
  }, [wrapMutation.status])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Wrap ETH'
      h={isMobile ? 'full' : 'unset'}
      mt={isMobile ? '40px' : 'auto'}
    >
      <HStack justifyContent='space-between' mt={isMobile ? '32px' : '24px'}>
        <Text {...paragraphMedium}>Balance</Text>
        <Text {...paragraphMedium}>{NumberUtil.formatThousands(ethBalance, 6)} ETH</Text>
      </HStack>
      <Box my='12px'>
        <AmountSlider
          variant='base'
          value={sliderValue}
          disabled={isExceedsBalance}
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
          <Text {...paragraphMedium}>ETH</Text>
        </InputRightElement>
      </InputGroup>
      <InputGroup display='block' mt={isMobile ? '32px' : '24px'}>
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
          <Text {...paragraphMedium}>WETH</Text>
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
          isDisabled={!displayAmount || isExceedsBalance}
          onClick={handleWrap}
          status={wrapMutation.status}
        >
          Wrap
        </ButtonWithStates>
        {!displayAmount && wrapMutation.status === 'idle' && (
          <Text {...paragraphRegular} color='grey.500'>
            Enter amount
          </Text>
        )}
        {wrapMutation.isPending && (
          <Text {...paragraphRegular} color='grey.500'>
            Processing transaction...
          </Text>
        )}
      </HStack>
    </Modal>
  )
}
