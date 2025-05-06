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
import React, {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isMobile } from 'react-device-detect'
import BuyButton from '@/components/common/markets/buy-button'
import TradeWidgetSkeleton, {
  SkeletonType,
} from '@/components/common/skeleton/trade-widget-skeleton'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import InfiniteIcon from '@/resources/icons/infinite-icon.svg'
import {
  ClickEvent,
  useAmplitude,
  useBalanceQuery,
  useBalanceService,
  useTradingService,
} from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface MarketPageBuyFormProps {
  setOutcomeIndex: Dispatch<SetStateAction<number>>
  slideMarket?: Market
}

export default function MarketPageBuyForm({
  setOutcomeIndex,
  slideMarket,
}: MarketPageBuyFormProps) {
  const { balanceLoading } = useBalanceService()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { trackClicked } = useAmplitude()
  const queryClient = useQueryClient()
  const {
    collateralAmount,
    setCollateralAmount,
    market: selectedMarket,
    trade,
    quotesYes,
    quotesNo,
    resetQuotes,
  } = useTradingService()

  const [displayAmount, setDisplayAmount] = useState('')
  const [showReturnPercent, setShowReturnPercent] = useState(false)
  const [showFeeInValue, setShowFeeInValue] = useState(false)
  const [slippage, setSlippage] = useState(localStorage.getItem('defaultMarketSlippage') || '5')
  const [showSlippageDetails, setShowSlippageDetails] = useState(false)
  const [quotesLoading, setQuotesLoading] = useState(false)

  const market = selectedMarket || slideMarket

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
    trackClicked(ClickEvent.TradingWidgetPricePrecetChosen, {
      amount: value,
      marketAddress: market?.slug,
      marketType: market?.marketType,
      marketTags: market?.tags,
      marketMakerType: 'AMM',
      assetType: 'money',
    })
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
      setQuotesLoading(false)
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

  const renderButtonContent = (title: number) => {
    if (title === 100) {
      if (isMobile) {
        return 'MAX'
      }
      return `${
        balanceLoading ? (
          <Box w='90px'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        ) : (
          NumberUtil.formatThousands(balance, market?.collateralToken.symbol === 'USDC' ? 1 : 6)
        )
      } ${market?.collateralToken.symbol}`
    }
    return `${title}%`
  }

  useEffect(() => {
    if (+collateralAmount) {
      setQuotesLoading(true)
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
      <Flex justifyContent='space-between' alignItems='center'>
        <Flex gap='4px'>
          <StepBadge content={'1'} />
          <Text {...paragraphMedium} color={'grey.500'}>
            Enter amount
          </Text>
        </Flex>
        {balanceLoading ? (
          <Box w='90px'>
            <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
          </Box>
        ) : (
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
                  borderColor: 'grey.600',
                  color: 'grey.600',
                }}
                disabled={balanceLoading}
              >
                {renderButtonContent(title)}
              </Button>
            ))}
          </Flex>
        )}
      </Flex>
      <Stack
        w={'full'}
        borderRadius='8px'
        border={'1px solid grey.50'}
        borderColor={isExceedsBalance ? 'red' : 'border'}
        mt='8px'
      >
        <InputGroup>
          <Input
            h='32px'
            variant='outlined'
            value={displayAmount}
            onChange={(e) => handleInputValueChange(e.target.value)}
            placeholder='0'
            css={css`
              caret-color: var(--chakra-colors-grey-500);
            `}
            type='number'
            inputMode='decimal'
            pattern='[0-9]*'
            min='0'
          />
          <InputRightElement h='16px' top='8px' right={isMobile ? '8px' : '12px'} w='fit'>
            <Text {...paragraphMedium} color={'grey.500'}>
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
        <Text {...paragraphRegular} color={'grey.500'}>
          Slippage Tolerance {slippage === '100' ? 'Infinite' : !slippage ? '0%' : `${slippage}%`}
        </Text>
        <Box
          transform={`rotate(${showSlippageDetails ? '180deg' : 0})`}
          transition='0.5s'
          color={'grey.500'}
        >
          <ChevronDownIcon width='16px' height='16px' />
        </Box>
      </HStack>
      {showSlippageDetails && (
        <HStack w='full' gap='8px' justifyContent='space-between' mt='8px'>
          <InputGroup flex={isMobile ? 2 : 1}>
            <Input
              variant='outlined'
              value={slippage}
              onChange={(e) => handleSlippageChange(e.target.value)}
              placeholder='0'
              css={css`
                caret-color: var(--chakra-colors-grey-500);
              `}
              type='number'
              inputMode='decimal'
              pattern='[0-9]*'
              min='0'
              h='24px'
            />
            <InputRightElement
              h='16px'
              top={isMobile ? '8px' : '4px'}
              right={isMobile ? '8px' : '4px'}
              w='fit'
            >
              <Text {...paragraphMedium} color={'grey.500'}>
                %
              </Text>
            </InputRightElement>
          </InputGroup>
          {[1, 5, 7, 100].map((title) => (
            <Button
              variant='grey'
              key={title}
              flex={1}
              onClick={() => handleSlippageClicked(title)}
              py='2px'
              h={isMobile ? '32px' : '24px'}
            >
              {title === 100 ? <InfiniteIcon /> : `${title}%`}
            </Button>
          ))}
        </HStack>
      )}
      <HStack w='full' justifyContent='start' mt='24px'>
        <Flex gap='4px' alignItems='center'>
          <StepBadge content={'2'} />
          <Text {...paragraphRegular} color={'grey.500'}>
            Select outcome
          </Text>
        </Flex>
      </HStack>

      {market && (
        <>
          <Box mt='8px' />
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
            marketType={market.marketType}
            showReturnPercent={showReturnPercent}
            setShowReturnPercent={setShowReturnPercent}
            showFeeInValue={showFeeInValue}
            setShowFeeInValue={setShowFeeInValue}
            resetForm={resetForm}
            quotesLoading={quotesLoading}
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
            marketType={market.marketType}
            showReturnPercent={showReturnPercent}
            setShowReturnPercent={setShowReturnPercent}
            showFeeInValue={showFeeInValue}
            setShowFeeInValue={setShowFeeInValue}
            resetForm={resetForm}
            quotesLoading={quotesLoading}
          />
        </>
      )}
    </>
  )
}

type StepBadgeProps = {
  content: string
}

const StepBadge = memo(({ content }: StepBadgeProps) => {
  return (
    <Flex
      borderRadius='999px'
      w='16px'
      h='16px'
      bg={'var(--chakra-colors-grey-500)'}
      alignItems='center'
      justifyContent='center'
      fontSize='12px'
      fontWeight='700'
      color='grey.100'
    >
      {content}
    </Flex>
  )
})

StepBadge.displayName = 'StepBadge'
