import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import debounce from 'lodash.debounce'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import ButtonWithStates from '@/components/common/button-with-states'
import TradeWidgetSkeleton, {
  SkeletonType,
} from '@/components/common/skeleton/trade-widget-skeleton'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { useToken } from '@/hooks/use-token'
import BlockIcon from '@/resources/icons/block.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import InfoIcon from '@/resources/icons/tooltip-icon.svg'
import {
  ClickEvent,
  HistoryPositionWithType,
  TradeClickedMetadata,
  TradeQuotes,
  useAmplitude,
  useBalanceService,
  usePosition,
  useTradingService,
} from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup, MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

const _transformSellValue = (value: string) => {
  const [wholeNumber, fractionalNumber] = value.split('.')

  // const fractionalNumberLength = fractionalNumber?.length || 0
  // const percentage = fractionalNumberLength <= 6 ? 0.99 : fractionalNumberLength === 0 ? 1 : 0.91
  const percentage = 1

  let zeroWholeFraction: string = ['0', fractionalNumber].join('.')
  zeroWholeFraction = String(+zeroWholeFraction * percentage)
  // zeroWholeFraction = Number(zeroWholeFraction)
  const [, _fractionalNumber] = zeroWholeFraction.split('.')
  return [wholeNumber, _fractionalNumber].join('.')
}

interface SellFormProps {
  setOutcomeIndex: Dispatch<SetStateAction<number>>
  marketGroup?: MarketGroup
  setSelectedMarket?: (market: Market) => void
  analyticParams?: { quickBetSource: string; source: string }
}

export function SellForm({
  setOutcomeIndex,
  marketGroup,
  setSelectedMarket,
  analyticParams,
}: SellFormProps) {
  /**
   * TRADING SERVICE
   */
  const {
    collateralAmount,
    setCollateralAmount,
    balanceOfCollateralToSellYes,
    balanceOfCollateralToSellNo,
    quotesYes,
    quotesNo,
    trade,
    approveSellMutation,
    checkApprovedForSell,
    market,
    resetQuotes,
    sellBalanceLoading,
  } = useTradingService()
  const queryClient = useQueryClient()
  const [sliderValue, setSliderValue] = useState(0)
  const [outcomeChoice, setOutcomeChoice] = useState<string | null>(null)
  const [quoteYes, setQuoteYes] = useState<TradeQuotes | undefined | null>()
  const [quoteNo, setQuoteNo] = useState<TradeQuotes | undefined | null>()
  const [isApproved, setIsApproved] = useState(true)
  const [slippage, setSlippage] = useState('5')
  const [showSlippageDetails, setShowSlippageDetails] = useState(false)
  const [quotesLoading, setQuotesLoading] = useState(false)
  const toast = useToast()

  const { client } = useWeb3Service()
  const { isOpen: isOpenSelectMarketMenu, onToggle: onToggleSelectMarketMenu } = useDisclosure()
  const { data: allMarketsPositions } = usePosition()
  const INFO_MSG = 'Market is locked. Trading stopped. Please await for final resolution.'

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) =>
          position.type === 'amm' &&
          position.market.id.toLowerCase() === market?.address?.toLowerCase()
      ) as HistoryPositionWithType[],
    [allMarketsPositions, market]
  )

  // const positionsGroup = useMemo(() => {
  //   if (marketGroup) {
  //     return allMarketsPositions?.filter((position) =>
  //       marketGroup.markets.some((market) => market.address === position.market.id)
  //     )
  //   }
  // }, [marketGroup, allMarketsPositions])

  // const getTotalContractsAmount = (address: Address) => {
  //   const positionsForMarket = positionsGroup?.filter(
  //     (position) => position.market.id.toLowerCase() === address.toLowerCase()
  //   )
  //   if (!positionsForMarket) {
  //     return '0'
  //   }
  //   return positionsForMarket.reduce((a, b) => {
  //     return new BigNumber(a).plus(new BigNumber(b.outcomeTokenAmount || '0')).toString()
  //   }, '0')
  // }

  /**
   * ANALITYCS
   */
  const { trackClicked } = useAmplitude()

  const getApprovedForSellState = async () => {
    if (client === 'eoa') {
      const result = await checkApprovedForSell()
      setIsApproved(result)
      return
    }
  }

  useEffect(() => {
    if (!outcomeChoice) {
      setQuoteYes(quotesYes)
      setQuoteNo(quotesNo)
      return
    }
    if (outcomeChoice === 'yes') {
      setQuoteYes(quotesYes)
      return
    }
    if (outcomeChoice === 'no') {
      setQuoteNo(quotesNo)
      return
    }
  }, [outcomeChoice, quotesYes, quotesNo])

  /**
   * BALANCE
   */
  const { setToken, token } = useBalanceService()

  const balance = useMemo(() => {
    if (outcomeChoice) {
      let _balance =
        outcomeChoice === 'yes' ? balanceOfCollateralToSellYes : balanceOfCollateralToSellNo
      _balance = _transformSellValue(_balance)
      return _balance
    }
  }, [outcomeChoice, balanceOfCollateralToSellYes, balanceOfCollateralToSellNo])

  const isZeroBalance = !(Number(balance) > 0)

  const { isOpen: isYesOpen, onOpen: onYesOpen, onClose: onYesClose } = useDisclosure()
  const { isOpen: isNoOpen, onOpen: onNoOpen, onClose: onNoClose } = useDisclosure()

  const { data: collateralToken } = useToken(market?.collateralToken.address)

  /**
   * Amount to display in UI and reduce queries
   */
  const [displayAmount, setDisplayAmount] = useState('')

  /**
   * SLIDER
   */

  const [showTooltip, setShowTooltip] = useState(false)

  const handleInputValueChange = (value: string) => {
    if (!+value) {
      setDisplayAmount(value)
      setCollateralAmount(value)
      return
    }
    const _collateralAmount = _transformSellValue(value)
    console.log('_collateralAmount', _collateralAmount)
    setDisplayAmount(_collateralAmount)
    setCollateralAmount(_collateralAmount)
    return
  }

  const refetchQuotesYes = useCallback(
    debounce(async function () {
      await queryClient.refetchQueries({
        queryKey: ['tradeQuotesYes'],
      })
      setQuotesLoading(false)
    }, 500),
    []
  )

  const refetchQuotesNo = useCallback(
    debounce(async function () {
      await queryClient.refetchQueries({
        queryKey: ['tradeQuotesNo'],
      })
      setQuotesLoading(false)
    }, 500),
    []
  )

  const onSlide = useCallback(
    (value: number) => {
      setSliderValue(value)
      if (value == 0 || isZeroBalance) {
        setDisplayAmount('')
        return
      }
      if (value == 100) {
        // _displayAmount = NumberUtil.toFixed(balance, 6)
        // _displayAmount = _transformCollateralAmount(balance ?? '0')
        // console.log('onSlide _displayAmount', _displayAmount)
        setDisplayAmount(balance ?? '0')
        return
      }
      const amountByPercent = (Number(balance) * value) / 100

      // _displayAmount = amountByPercent.toString()
      // _displayAmount = _transformCollateralAmount(_displayAmount)
      // console.log('onSlide amountByPercent _displayAmount', _displayAmount)
      const _collateralAmount = _transformSellValue(amountByPercent.toString())
      setDisplayAmount(_collateralAmount)
    },
    [sliderValue, balance, isZeroBalance]
  )

  const positionsYes = positions?.find((position) => position.outcomeIndex === 0)
  const positionsNo = positions?.find((position) => position.outcomeIndex === 1)

  const perShareYes = useMemo(() => {
    if (!token) {
      return (
        <Box w='80px'>
          <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
        </Box>
      )
    }
    return quoteYes
      ? `${NumberUtil.formatThousands(quoteYes.outcomeTokenPrice, 6)} ${
          market?.collateralToken.symbol
        }`
      : `${NumberUtil.toFixed((market?.prices[0] || 1) / 100, 3)} ${token?.symbol}`
  }, [quoteYes, market?.collateralToken.symbol, market?.prices, token?.symbol])

  const perShareNo = useMemo(() => {
    if (!token) {
      return (
        <Box w='80px'>
          <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
        </Box>
      )
    }
    return quoteNo
      ? `${NumberUtil.formatThousands(quoteNo.outcomeTokenPrice, 6)} ${
          market?.collateralToken.symbol
        }`
      : `${NumberUtil.toFixed((market?.prices[1] || 1) / 100, 3)} ${token?.symbol}`
  }, [quoteNo, market?.collateralToken.symbol, market?.prices, token?.symbol])

  const handleTradeClicked = async () => {
    trackClicked(ClickEvent.SellTradeClicked, {
      address: market?.address || '0x',
      marketType: marketGroup ? 'group' : 'single',
      ...(analyticParams ? analyticParams : {}),
    })
    const index = outcomeChoice === 'yes' ? 0 : 1
    setOutcomeIndex(index)
    await trade(index, slippage)
  }

  const approveSell = async () =>
    approveSellMutation.mutateAsync(undefined, {
      onError: () => {
        setIsApproved(false)
        const id = toast({
          render: () => (
            <Toast title={`Something went wrong during approve transaction broadcast.`} id={id} />
          ),
        })
      },
      onSuccess: () => setIsApproved(true),
    })

  const handleApproveClicked = async () => {
    trackClicked(ClickEvent.SellApproveClicked, {
      marketAddress: market?.slug,
      // @ts-ignore
      outcome: outcomeChoice === 'yes' ? 'Yes' : 'No',
      walletType: 'eoa',
      ...(analyticParams ? analyticParams : {}),
    })
    await approveSell()
  }

  const handleSlippageChange = (value: string) => {
    if (!value) {
      setSlippage('')
      return
    }
    if (+value >= 100) {
      setSlippage('100')
      return
    }
    setSlippage(value)
  }

  const handleSlippageClicked = (value: number) => {
    setSlippage(value.toString())
  }

  const toggleShowSlippageDetails = () => setShowSlippageDetails(!showSlippageDetails)

  const isExceedsBalance = useMemo(() => {
    if (outcomeChoice) {
      return new BigNumber(collateralAmount).isGreaterThan(
        new BigNumber(
          outcomeChoice === 'yes'
            ? _transformSellValue(balanceOfCollateralToSellYes)
            : _transformSellValue(balanceOfCollateralToSellNo)
        )
      )
    }
    return false
  }, [collateralAmount, outcomeChoice, balanceOfCollateralToSellYes, balanceOfCollateralToSellNo])

  const tradeButton = useMemo(() => {
    if (quotesLoading) {
      return null
    }
    if (displayAmount) {
      if (!isApproved) {
        return (
          <ButtonWithStates
            status={approveSellMutation.status}
            variant='white'
            w='full'
            onClick={handleApproveClicked}
          >
            Approve Sell
          </ButtonWithStates>
        )
      }
      return (
        <Button variant='white' w='full' onClick={handleTradeClicked} isDisabled={isExceedsBalance}>
          Trade
        </Button>
      )
    }
    return null
  }, [
    displayAmount,
    isApproved,
    isMobile,
    isExceedsBalance,
    approveSellMutation.status,
    quotesLoading,
  ])

  useEffect(() => {
    if (isZeroBalance) {
      setSliderValue(0)
      return
    }
    const percentByAmount = Number(((Number(collateralAmount) / Number(balance)) * 100).toFixed())
    setSliderValue(percentByAmount)
  }, [collateralAmount, balance, isZeroBalance])

  useEffect(() => {
    if (+displayAmount) {
      setQuotesLoading(true)
      if (outcomeChoice === 'yes') {
        refetchQuotesYes()
      }
      if (outcomeChoice === 'no') {
        refetchQuotesNo()
      }
    }
  }, [displayAmount, market])

  useEffect(() => {
    if (market && collateralToken) {
      setToken(collateralToken)
    }
  }, [market, collateralToken])

  useEffect(() => {
    if (outcomeChoice) {
      getApprovedForSellState()
    }
  }, [outcomeChoice])

  useEffect(() => {
    resetQuotes()
    setCollateralAmount('')
    setDisplayAmount('')
    setSliderValue(0)
  }, [market?.address])

  return (
    <>
      {marketGroup && (
        <>
          <Box mx={isMobile ? '16px' : 0}>
            <Button
              variant='transparentLight'
              w='full'
              justifyContent='space-between'
              mb={isOpenSelectMarketMenu ? '8px' : isMobile ? '32px' : '8px'}
              onClick={onToggleSelectMarketMenu}
              rightIcon={
                <Box
                  transform={`rotate(${isOpenSelectMarketMenu ? '180deg' : 0})`}
                  transition='0.5s'
                  color='var(--chakra-colors-text-100)'
                >
                  <ChevronDownIcon width='16px' height='16px' />
                </Box>
              }
            >
              <HStack gap='8px' color='var(--chakra-colors-text-100)'>
                <PredictionsIcon />
                <Text {...paragraphMedium} color='var(--chakra-colors-text-100)'>
                  {market?.proxyTitle ?? market?.title}
                </Text>
              </HStack>
            </Button>
          </Box>
          {/*{isOpenSelectMarketMenu && (*/}
          {/*  <VStack*/}
          {/*    gap={isMobile ? '16px' : '8px'}*/}
          {/*    mb={isMobile ? '16px' : '8px'}*/}
          {/*    mx={isMobile ? '16px' : 0}*/}
          {/*  >*/}
          {/*    {marketGroup?.markets.map((market) => (*/}
          {/*      <Button*/}
          {/*        key={market.address}*/}
          {/*        onClick={() => {*/}
          {/*          setSelectedMarket && setSelectedMarket(market)*/}
          {/*          onToggleSelectMarketMenu()*/}
          {/*          setOutcomeChoice(null)*/}
          {/*        }}*/}
          {/*        flexDirection='column'*/}
          {/*        variant='transparentLight'*/}
          {/*        w='full'*/}
          {/*      >*/}
          {/*        <HStack mb='8px' w='full'>*/}
          {/*          <HStack justifyContent='space-between' w='full' alignItems='flex-start'>*/}
          {/*            <Text {...paragraphMedium} color='var(--chakra-colors-text-100)'>*/}
          {/*              {market?.proxyTitle ?? market?.title}*/}
          {/*            </Text>*/}
          {/*            <Text {...paragraphMedium} color='var(--chakra-colors-text-100)'>*/}
          {/*              {NumberUtil.formatThousands(*/}
          {/*                getTotalContractsAmount(market.address as Address),*/}
          {/*                6*/}
          {/*              )}{' '}*/}
          {/*              Contracts*/}
          {/*            </Text>*/}
          {/*          </HStack>*/}
          {/*        </HStack>*/}
          {/*      </Button>*/}
          {/*    ))}*/}
          {/*  </VStack>*/}
          {/*)}*/}
        </>
      )}
      {!isOpenSelectMarketMenu && (
        <>
          <VStack mt={marketGroup ? 0 : '24px'}>
            {positionsYes && (
              <Button
                bg={outcomeChoice === 'yes' ? 'white' : 'green.500'}
                px='12px'
                py='8px'
                w='full'
                h='unset'
                alignItems='flex-start'
                flexDir='column'
                onClick={() => {
                  if (market?.status === MarketStatus.LOCKED) {
                    onYesOpen()
                    return
                  }
                  trackClicked<TradeClickedMetadata>(ClickEvent.SellClicked, {
                    outcome: 'Yes',
                    marketAddress: market?.address || '0x',
                    walletType: client,
                    ...(analyticParams ? analyticParams : {}),
                  })
                  setDisplayAmount('')
                  setOutcomeChoice('yes')
                  setCollateralAmount('')
                }}
                borderRadius='8px'
                _hover={{
                  backgroundColor: outcomeChoice === 'yes' ? 'white' : 'green.300',
                }}
                gap={isMobile ? '16px' : '8px'}
              >
                {isYesOpen ? (
                  <VStack w={'full'} h={'72px'}>
                    <HStack w={'full'} justifyContent={'space-between'}>
                      <Icon as={BlockIcon} width={'16px'} height={'16px'} color={'white'} />
                      <Icon
                        as={CloseIcon}
                        width={'16px'}
                        height={'16px'}
                        color={'white'}
                        onClick={(event) => {
                          event.stopPropagation()
                          onYesClose()
                        }}
                      />
                    </HStack>
                    <HStack w={'full'}>
                      <Text
                        {...paragraphMedium}
                        color='var(--chakra-colors-text-100)'
                        textAlign={'left'}
                        whiteSpace='normal'
                      >
                        {INFO_MSG}
                      </Text>
                      <Box w={'45px'}></Box>
                    </HStack>
                  </VStack>
                ) : (
                  <>
                    <HStack
                      color={outcomeChoice === 'yes' ? 'black' : 'white'}
                      justifyContent='space-between'
                      w='full'
                    >
                      <HStack gap='8px'>
                        <ThumbsUpIcon width='16px' height='16px' />
                        <Text
                          {...paragraphMedium}
                          color={outcomeChoice === 'yes' ? 'black' : 'white'}
                        >
                          Yes
                        </Text>
                      </HStack>
                      <Text
                        {...paragraphMedium}
                        color={outcomeChoice === 'yes' ? 'black' : 'white'}
                      >
                        {NumberUtil.toFixed(positionsYes.outcomeTokenAmount, 6)} Contracts
                      </Text>
                    </HStack>
                    <VStack ml='24px' w='calc(100% - 24px)' gap={isMobile ? '8px' : '4px'}>
                      <HStack justifyContent='space-between' w='full'>
                        <HStack gap='4px'>
                          <Text
                            {...paragraphRegular}
                            color={outcomeChoice === 'yes' ? 'black' : 'white'}
                          >
                            Per Share
                          </Text>
                        </HStack>
                        <Text
                          {...paragraphRegular}
                          color={outcomeChoice === 'yes' ? 'black' : 'white'}
                        >
                          {perShareYes}
                        </Text>
                      </HStack>
                      <HStack justifyContent='space-between' w='full'>
                        <HStack gap='4px'>
                          <Text
                            {...paragraphRegular}
                            color={outcomeChoice === 'yes' ? 'black' : 'white'}
                          >
                            Total
                          </Text>
                        </HStack>
                        <Text
                          {...paragraphRegular}
                          color={outcomeChoice === 'yes' ? 'black' : 'white'}
                        >{`${NumberUtil.toFixed(positionsYes.collateralAmount, 3)} ${
                          positionsYes.market.collateral?.symbol
                        }`}</Text>
                      </HStack>
                    </VStack>
                  </>
                )}
              </Button>
            )}
            {positionsNo && (
              <Button
                bg={outcomeChoice === 'no' ? 'white' : 'red.500'}
                px='12px'
                py='8px'
                w='full'
                h='unset'
                alignItems='flex-start'
                flexDir='column'
                onClick={() => {
                  if (market?.status === MarketStatus.LOCKED) {
                    onNoOpen()
                    return
                  }
                  trackClicked<TradeClickedMetadata>(ClickEvent.SellClicked, {
                    outcome: 'No',
                    marketAddress: market?.address || '0x',
                    walletType: client,
                    ...(analyticParams ? analyticParams : {}),
                  })
                  setDisplayAmount('')
                  setOutcomeChoice('no')
                  setCollateralAmount('')
                }}
                borderRadius='8px'
                _hover={{
                  backgroundColor: outcomeChoice === 'no' ? 'white' : 'red.300',
                }}
                gap={isMobile ? '16px' : '8px'}
              >
                {isNoOpen ? (
                  <VStack w={'full'} h={'72px'}>
                    <HStack w={'full'} justifyContent={'space-between'}>
                      <Icon as={BlockIcon} width={'16px'} height={'16px'} color={'white'} />
                      <Icon
                        as={CloseIcon}
                        width={'16px'}
                        height={'16px'}
                        color={'white'}
                        onClick={(event) => {
                          event.stopPropagation()
                          onNoClose()
                        }}
                      />
                    </HStack>
                    <HStack w={'full'}>
                      <Text
                        {...paragraphMedium}
                        color='var(--chakra-colors-text-100)'
                        textAlign={'left'}
                        whiteSpace='normal'
                      >
                        {INFO_MSG}
                      </Text>
                      <Box w={'45px'}></Box>
                    </HStack>
                  </VStack>
                ) : (
                  <>
                    <HStack
                      color={outcomeChoice === 'no' ? 'black' : 'white'}
                      justifyContent='space-between'
                      w='full'
                    >
                      <HStack gap='8px'>
                        <ThumbsDownIcon width='16px' height='16px' />
                        <Text
                          {...paragraphMedium}
                          color={outcomeChoice === 'no' ? 'black' : 'white'}
                        >
                          No
                        </Text>
                      </HStack>
                      <Text {...paragraphMedium} color={outcomeChoice === 'no' ? 'black' : 'white'}>
                        {NumberUtil.toFixed(positionsNo.outcomeTokenAmount, 6)} Contracts
                      </Text>
                    </HStack>
                    <VStack ml='24px' w='calc(100% - 24px)' gap={isMobile ? '8px' : '4px'}>
                      <HStack justifyContent='space-between' w='full'>
                        <HStack gap='4px'>
                          <Text
                            {...paragraphRegular}
                            color={outcomeChoice === 'no' ? 'black' : 'white'}
                          >
                            Per Share
                          </Text>
                        </HStack>
                        <Text
                          {...paragraphRegular}
                          color={outcomeChoice === 'no' ? 'black' : 'white'}
                        >
                          {perShareNo}
                        </Text>
                      </HStack>
                      <HStack justifyContent='space-between' w='full'>
                        <HStack gap='4px'>
                          <Text
                            {...paragraphRegular}
                            color={outcomeChoice === 'no' ? 'black' : 'white'}
                          >
                            Total
                          </Text>
                        </HStack>
                        <Text
                          {...paragraphRegular}
                          color={outcomeChoice === 'no' ? 'black' : 'white'}
                        >{`${NumberUtil.toFixed(positionsNo.collateralAmount, 3)} ${
                          positionsNo.market.collateral?.symbol
                        }`}</Text>
                      </HStack>
                    </VStack>
                  </>
                )}
              </Button>
            )}
          </VStack>
          {outcomeChoice && (
            <Box mt='24px'>
              <Flex justifyContent='space-between'>
                <Text {...paragraphMedium} color='var(--chakra-colors-text-100)'>
                  Balance
                </Text>
                {sellBalanceLoading ? (
                  <Box w='120px'>
                    <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
                  </Box>
                ) : (
                  <Text {...paragraphMedium} color='var(--chakra-colors-text-100)'>
                    {NumberUtil.formatThousands(balance, 6)} {token?.symbol}
                  </Text>
                )}
              </Flex>
              <Slider
                aria-label='slider-ex-6'
                value={sliderValue}
                onChange={(val) => onSlide(val)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onChangeEnd={() => setCollateralAmount(displayAmount)}
                isDisabled={isZeroBalance}
                focusThumbOnChange={false}
                h={isMobile ? '40px' : '8px'}
                py={isMobile ? '0px !important' : '4px'}
              >
                <SliderTrack bg='var(--chakra-colors-greyTransparent-600)'>
                  <SliderFilledTrack bg='var(--chakra-colors-text-100)' />
                </SliderTrack>
                <SliderThumb bg='var(--chakra-colors-text-100)' />
              </Slider>
              <Stack w={'full'} mt={isMobile ? 0 : '8px'} gap='4px'>
                <HStack justifyContent='space-between'>
                  <Text {...paragraphMedium} color='var(--chakra-colors-text-100)'>
                    Enter amount
                  </Text>
                  {isExceedsBalance && (
                    <HStack color='var(--chakra-colors-text-100)' gap='4px'>
                      <InfoIcon width='16px' height='16px' />
                      <Text {...paragraphMedium} color='var(--chakra-colors-text-100)'>
                        Not enough funds
                      </Text>
                    </HStack>
                  )}
                </HStack>
                <InputGroup>
                  <Input
                    variant='outlined'
                    value={+displayAmount ? NumberUtil.toFixed(displayAmount, 6) : displayAmount}
                    onChange={(e) => handleInputValueChange(e.target.value)}
                    placeholder='0'
                    css={css`
                      caret-color: var(--chakra-colors-text-100);
                      border-color: var(--chakra-colors-greyTransparent-200);
                      color: var(--chakra-colors-text-100);
                    `}
                    _focus={{
                      borderColor: 'var(--chakra-colors-greyTransparent-200)',
                    }}
                    _placeholder={{
                      color: 'var(--chakra-colors-text-100)',
                    }}
                    type='number'
                    inputMode='decimal'
                    pattern='[0-9]*'
                  />
                  <InputRightElement
                    h='16px'
                    top={isMobile ? '8px' : '4px'}
                    right={isMobile ? '8px' : '4px'}
                    w='fit'
                  >
                    <Text {...paragraphMedium} color='var(--chakra-colors-text-100)'>
                      {market?.collateralToken.symbol}
                    </Text>
                  </InputRightElement>
                </InputGroup>
              </Stack>
              {/*<HStack*/}
              {/*  w='full'*/}
              {/*  justifyContent='space-between'*/}
              {/*  mt='12px'*/}
              {/*  cursor='pointer'*/}
              {/*  onClick={toggleShowSlippageDetails}*/}
              {/*>*/}
              {/*  <Text {...paragraphRegular} color='white'>*/}
              {/*    Slippage Tolerance{' '}*/}
              {/*    {slippage === '100' ? 'Infinite' : !slippage ? '0%' : `${slippage}%`}*/}
              {/*  </Text>*/}
              {/*  <Box*/}
              {/*    transform={`rotate(${showSlippageDetails ? '180deg' : 0})`}*/}
              {/*    transition='0.5s'*/}
              {/*    color='white'*/}
              {/*  >*/}
              {/*    <ChevronDownIcon width='16px' height='16px' />*/}
              {/*  </Box>*/}
              {/*</HStack>*/}
              {/*{showSlippageDetails && (*/}
              {/*  <HStack w='full' gap='8px' justifyContent='space-between' mt='8px'>*/}
              {/*    <InputGroup flex={1}>*/}
              {/*      <Input*/}
              {/*        variant='outlined'*/}
              {/*        value={slippage}*/}
              {/*        onChange={(e) => handleSlippageChange(e.target.value)}*/}
              {/*        placeholder='0'*/}
              {/*        css={css`*/}
              {/*          caret-color: white;*/}
              {/*        `}*/}
              {/*        type='number'*/}
              {/*      />*/}
              {/*      <InputRightElement*/}
              {/*        h='16px'*/}
              {/*        top={isMobile ? '8px' : '4px'}*/}
              {/*        right={isMobile ? '8px' : '4px'}*/}
              {/*        w='fit'*/}
              {/*      >*/}
              {/*        <Text {...paragraphMedium} color='white'>*/}
              {/*          %*/}
              {/*        </Text>*/}
              {/*      </InputRightElement>*/}
              {/*    </InputGroup>*/}
              {/*    {[0.1, 0.5, 1, 100].map((title) => (*/}
              {/*      <Button*/}
              {/*        variant='transparentLight'*/}
              {/*        key={title}*/}
              {/*        flex={1}*/}
              {/*        onClick={() => handleSlippageClicked(title)}*/}
              {/*        color='white'*/}
              {/*        py='2px'*/}
              {/*        h={isMobile ? '32px' : '24px'}*/}
              {/*      >*/}
              {/*        {title === 100 ? <InfiniteIcon /> : `${title}%`}*/}
              {/*      </Button>*/}
              {/*    ))}*/}
              {/*  </HStack>*/}
              {/*)}*/}
              <VStack my='24px' gap={isMobile ? '8px' : '4px'} w='full'>
                <HStack justifyContent='space-between' w='full'>
                  <HStack gap='4px'>
                    <Text {...paragraphRegular} color='var(--chakra-colors-text-100)'>
                      Price impact
                    </Text>
                  </HStack>
                  {quotesLoading ? (
                    <Box w='40px'>
                      <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
                    </Box>
                  ) : (
                    <Text
                      {...paragraphRegular}
                      color='var(--chakra-colors-text-100)'
                    >{`${NumberUtil.toFixed(
                      outcomeChoice == 'yes' ? quoteYes?.priceImpact : quoteNo?.priceImpact,
                      2
                    )}%`}</Text>
                  )}
                </HStack>
                <HStack justifyContent='space-between' w='full'>
                  <HStack gap='4px'>
                    <Text {...paragraphRegular} color='var(--chakra-colors-text-100)'>
                      ROI
                    </Text>
                  </HStack>
                  {quotesLoading ? (
                    <Box w='60px'>
                      <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
                    </Box>
                  ) : (
                    <Text {...paragraphRegular} color='var(--chakra-colors-text-100)'>
                      {NumberUtil.toFixed(outcomeChoice == 'yes' ? quoteYes?.roi : quoteNo?.roi, 2)}
                      %
                    </Text>
                  )}
                </HStack>
                <HStack justifyContent='space-between' w='full'>
                  <HStack gap='4px'>
                    <Text {...paragraphRegular} color='var(--chakra-colors-text-100)'>
                      Total
                    </Text>
                  </HStack>
                  {quotesLoading ? (
                    <Box w='120px'>
                      <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
                    </Box>
                  ) : (
                    <Text {...paragraphRegular} color='var(--chakra-colors-text-100)'>
                      {NumberUtil.toFixed(displayAmount, 6)} {token?.symbol}
                    </Text>
                  )}
                </HStack>
              </VStack>
              {tradeButton}
            </Box>
          )}
        </>
      )}
      {/*<ChakraSlider*/}
      {/*  defaultValue={0}*/}
      {/*  onChange={onSlide}*/}
      {/*  onMouseEnter={() => setShowTooltip(true)}*/}
      {/*  onMouseLeave={() => setShowTooltip(false)}*/}
      {/*  isDisabled={false}*/}
      {/*>*/}
      {/*  <SliderMark*/}
      {/*    value={0}*/}
      {/*    borderRadius='100%'*/}
      {/*    display='flex'*/}
      {/*    alignItems='center'*/}
      {/*    justifyContent='center'*/}
      {/*    mt='-1.5'*/}
      {/*    w='12px'*/}
      {/*    h='12px'*/}
      {/*    bg='blue.500'*/}
      {/*    zIndex='100'*/}
      {/*    onClick={() => setSliderValue(0)}*/}
      {/*    sx={{*/}
      {/*      pointerEvents: 'auto !important',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Box rounded='full' bg={'white'} w='8px' h='8px' />*/}
      {/*  </SliderMark>*/}
      {/*  {[20, 40, 60, 80].map((value) => (*/}
      {/*    <SliderMark*/}
      {/*      value={value}*/}
      {/*      borderRadius='100%'*/}
      {/*      display='flex'*/}
      {/*      alignItems='center'*/}
      {/*      justifyContent='center'*/}
      {/*      mt='-1.5'*/}
      {/*      key={value}*/}
      {/*      bg='blue.500'*/}
      {/*      w='12px'*/}
      {/*      h='12px'*/}
      {/*      zIndex='100'*/}
      {/*      sx={{*/}
      {/*        pointerEvents: 'auto !important',*/}
      {/*      }}*/}
      {/*      onClick={() => setSliderValue(value)}*/}
      {/*    >*/}
      {/*      <Box*/}
      {/*        rounded='full'*/}
      {/*        bg={sliderValue < value ? 'rgba(255, 255, 255, 0.2)' : 'white'}*/}
      {/*        w='8px'*/}
      {/*        h='8px'*/}
      {/*      />*/}
      {/*    </SliderMark>*/}
      {/*  ))}*/}
      {/*  <SliderMark*/}
      {/*    value={100}*/}
      {/*    borderRadius='100%'*/}
      {/*    display='flex'*/}
      {/*    alignItems='center'*/}
      {/*    justifyContent='center'*/}
      {/*    mt='-1.5'*/}
      {/*    ml='-2.5'*/}
      {/*    w='12px'*/}
      {/*    h='12px'*/}
      {/*    bg='blue.500'*/}
      {/*    zIndex='100'*/}
      {/*    sx={{*/}
      {/*      pointerEvents: 'auto !important',*/}
      {/*    }}*/}
      {/*    onClick={() => {*/}
      {/*      setSliderValue(100)*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Box*/}
      {/*      rounded='full'*/}
      {/*      bg={sliderValue === 100 ? 'white' : 'rgba(255, 255, 255, 0.2)'}*/}
      {/*      w='8px'*/}
      {/*      h='8px'*/}
      {/*    />*/}
      {/*  </SliderMark>*/}
      {/*  <SliderTrack bg='rgba(255, 255, 255, 0.20)'>*/}
      {/*    <SliderFilledTrack bg='white' />*/}
      {/*  </SliderTrack>*/}
      {/*</ChakraSlider>*/}
    </>
  )
}
