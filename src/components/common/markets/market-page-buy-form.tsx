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
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import InfiniteIcon from '@/resources/icons/infinite-icon.svg'
import { useBalanceQuery, useBalanceService, useTradingService } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface MarketPageBuyFormProps {
  setOutcomeIndex: Dispatch<SetStateAction<number>>
  marketList?: Market[]
}

export default function MarketPageBuyForm({ setOutcomeIndex, marketList }: MarketPageBuyFormProps) {
  const { balanceOfSmartWallet } = useBalanceQuery()
  const queryClient = useQueryClient()
  const { collateralAmount, setCollateralAmount, market, trade, quotesYes, quotesNo, resetQuotes } =
    useTradingService()

  const [displayAmount, setDisplayAmount] = useState('')
  const [showReturnPercent, setShowReturnPercent] = useState(false)
  const [showFeeInValue, setShowFeeInValue] = useState(false)
  const [slippage, setSlippage] = useState(localStorage.getItem('defaultMarketSlippage') || '5')
  const [showSlippageDetails, setShowSlippageDetails] = useState(false)

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

  const saveSlippageToLocalStorage = (value: string) => {
    localStorage.setItem('defaultMarketSlippage', value)
  }

  const handleSlippageChange = (value: string) => {
    if (!value) {
      setSlippage('')
      return
    }
    if (+value >= 100) {
      setSlippage('100')
      saveSlippageToLocalStorage('100')
      return
    }
    setSlippage(value)
    saveSlippageToLocalStorage(value)
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

  const handleSlippageClicked = (value: number) => {
    setSlippage(value.toString())
    saveSlippageToLocalStorage(value.toString())
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

  const toggleShowSlippageDetails = () => setShowSlippageDetails(!showSlippageDetails)

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
      <HStack
        w='full'
        justifyContent='space-between'
        mt='12px'
        cursor='pointer'
        onClick={toggleShowSlippageDetails}
      >
        <Text {...paragraphRegular} color='white'>
          Slippage Tolerance {slippage === '100' ? 'Infinite' : !slippage ? '0%' : `${slippage}%`}
        </Text>
        <Box
          transform={`rotate(${showSlippageDetails ? '180deg' : 0})`}
          transition='0.5s'
          color='white'
        >
          <ChevronDownIcon width='16px' height='16px' />
        </Box>
      </HStack>
      {showSlippageDetails && (
        <HStack w='full' gap='8px' justifyContent='space-between' mt='8px'>
          <InputGroup flex={1}>
            <Input
              variant='outlined'
              value={slippage}
              onChange={(e) => handleSlippageChange(e.target.value)}
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
                %
              </Text>
            </InputRightElement>
          </InputGroup>
          {[1, 5, 7, 100].map((title) => (
            <Button
              variant='transparentLight'
              key={title}
              flex={1}
              onClick={() => handleSlippageClicked(title)}
              color='white'
              py='2px'
              h={isMobile ? '32px' : '24px'}
            >
              {title === 100 ? <InfiniteIcon /> : `${title}%`}
            </Button>
          ))}
        </HStack>
      )}
      {market && (
        <>
          <Box mt='12px' />
          <BuyButton
            onClick={async () => {
              setOutcomeIndex(0)
              await trade(0, slippage)
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
              await trade(1, slippage)
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
