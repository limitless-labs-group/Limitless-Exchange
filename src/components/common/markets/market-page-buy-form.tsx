import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import debounce from 'lodash.debounce'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import BuyButton from '@/components/common/markets/buy-button'
import { useBalanceService, useTradingService } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface MarketPageBuyFormProps {
  setOutcomeIndex: Dispatch<SetStateAction<number>>
  marketList?: Market[]
}

export default function MarketPageBuyForm({ setOutcomeIndex, marketList }: MarketPageBuyFormProps) {
  const { balanceOfSmartWallet } = useBalanceService()
  const queryClient = useQueryClient()
  const { collateralAmount, setCollateralAmount, market, trade, quotesYes, quotesNo, resetQuotes } =
    useTradingService()

  const [displayAmount, setDisplayAmount] = useState('')
  const [showReturnPercent, setShowReturnPercent] = useState(false)
  const [showFeeInValue, setShowFeeInValue] = useState(false)

  const handleInputValueChange = (value: string) => {
    if (market?.collateralToken.symbol === 'USDC') {
      const decimals = value.split('.')[1]
      if (decimals && decimals.length > 1) {
        return
      }
      setDisplayAmount(value)
      setCollateralAmount(value)
      return
    }
    setDisplayAmount(value)
    setCollateralAmount(value)
    return
  }

  const handlePercentButtonClicked = (value: number) => {
    if (value == 100) {
      setDisplayAmount(
        NumberUtil.toFixed(balance, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
      )
      setCollateralAmount(
        NumberUtil.toFixed(balance, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
      )
      return
    }
    const amountByPercent = (Number(balance) * value) / 100
    setDisplayAmount(
      NumberUtil.toFixed(amountByPercent, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
    )
    setCollateralAmount(
      NumberUtil.toFixed(amountByPercent, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
    )
  }

  const refetchQuotes = useCallback(
    debounce(async function () {
      await queryClient.refetchQueries({
        queryKey: ['tradeQuotesYes'],
      })
      await queryClient.refetchQueries({
        queryKey: ['tradeQuotesNo'],
      })
    }, 500),
    []
  )

  const resetForm = () => {
    setDisplayAmount('')
    setCollateralAmount('')
    resetQuotes()
  }

  const balance = useMemo(() => {
    if (balanceOfSmartWallet) {
      return (
        balanceOfSmartWallet.find(
          (balanceItem) => balanceItem.contractAddress === market?.collateralToken.address
        )?.formatted || ''
      )
    }
    return ''
  }, [balanceOfSmartWallet, market])

  const isExceedsBalance = useMemo(() => {
    return new BigNumber(collateralAmount).isGreaterThan(balance)
  }, [collateralAmount, balance])

  useEffect(() => {
    if (+collateralAmount) {
      refetchQuotes()
    }
    if (!+collateralAmount) {
      resetQuotes()
    }
  }, [market, collateralAmount])

  useEffect(() => {
    setCollateralAmount('')
    setDisplayAmount('')
    resetQuotes()
  }, [market])

  return (
    <>
      <Flex justifyContent='space-between'>
        <Text {...paragraphMedium} color='white'>
          Balance
        </Text>
        <Text {...paragraphMedium} color='white'>
          {NumberUtil.formatThousands(balance, market?.collateralToken.symbol === 'USDC' ? 1 : 6)}{' '}
          {market?.collateralToken.symbol}
        </Text>
      </Flex>
      <HStack w='full' gap='4px' mt='4px'>
        {[10, 25, 50, 100].map((title) => (
          <Button
            variant='transparentLight'
            key={title}
            flex={1}
            onClick={() => handlePercentButtonClicked(title)}
            color='white'
          >
            {title === 100 ? 'MAX' : `${title}%`}
          </Button>
        ))}
      </HStack>
      <Stack
        w={'full'}
        borderRadius='2px'
        border={'1px solid grey.50'}
        borderColor={isExceedsBalance ? 'red' : 'border'}
        mt='8px'
      >
        <InputGroup>
          <Input
            variant='outlined'
            value={displayAmount}
            onChange={(e) => handleInputValueChange(e.target.value)}
            placeholder='0'
            css={css`
              caret-color: white;
            `}
            type='number'
          />
          <InputRightElement
            h='16px'
            top={isMobile ? '8px' : '4px'}
            right={isMobile ? '8px' : '4px'}
            w='fit'
          >
            <Text {...paragraphMedium} color='white'>
              {market?.collateralToken.symbol}
            </Text>
          </InputRightElement>
        </InputGroup>
      </Stack>
      {market && (
        <>
          <Box mt='16px' />
          <BuyButton
            onClick={async () => {
              setOutcomeIndex(0)
              await trade(0)
            }}
            isExceedsBalance={isExceedsBalance}
            market={market}
            quote={quotesYes}
            amount={collateralAmount}
            option='Yes'
            price={market.prices?.[0]}
            decimals={market.collateralToken?.decimals}
            marketType={!!marketList?.length ? 'group' : 'single'}
            showReturnPercent={showReturnPercent}
            setShowReturnPercent={setShowReturnPercent}
            showFeeInValue={showFeeInValue}
            setShowFeeInValue={setShowFeeInValue}
            resetForm={resetForm}
          />
          <Box mt='8px' />
          <BuyButton
            onClick={async () => {
              setOutcomeIndex(1)
              await trade(1)
            }}
            isExceedsBalance={isExceedsBalance}
            market={market}
            quote={quotesNo}
            amount={collateralAmount}
            option='No'
            price={market.prices?.[1]}
            decimals={market.collateralToken?.decimals}
            marketType={!!marketList?.length ? 'group' : 'single'}
            showReturnPercent={showReturnPercent}
            setShowReturnPercent={setShowReturnPercent}
            showFeeInValue={showFeeInValue}
            setShowFeeInValue={setShowFeeInValue}
            resetForm={resetForm}
          />
        </>
      )}
    </>
  )
}
