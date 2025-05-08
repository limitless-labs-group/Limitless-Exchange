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
import CloseIcon from '@/resources/icons/close-icon.svg'
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
import { MarketStatus } from '@/types'
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
}

export function SellForm({ setOutcomeIndex }: SellFormProps) {
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
    setStrategy,
  } = useTradingService()
  const queryClient = useQueryClient()
  const [sliderValue, setSliderValue] = useState(0)
  const [outcomeChoice, setOutcomeChoice] = useState<string | null>(null)
  const [quoteYes, setQuoteYes] = useState<TradeQuotes | undefined | null>()
  const [quoteNo, setQuoteNo] = useState<TradeQuotes | undefined | null>()
  const [isApproved, setIsApproved] = useState(true)
  const [slippage, setSlippage] = useState('5')
  const [quotesLoading, setQuotesLoading] = useState(false)
  const toast = useToast()

  const { client } = useWeb3Service()
  const { data: allMarketsPositions } = usePosition()
  const INFO_MSG = 'Market is locked. Trading stopped. Please await for final resolution.'

  const positions = useMemo(
    () =>
      allMarketsPositions?.positions.filter(
        (position) =>
          position.type === 'amm' &&
          (position as HistoryPositionWithType).market.id.toLowerCase() ===
            market?.address?.toLowerCase()
      ) as HistoryPositionWithType[],
    [allMarketsPositions, market]
  )

  const positionsYes = positions?.find((position) => position.outcomeIndex === 0)
  const positionsNo = positions?.find((position) => position.outcomeIndex === 1)

  useEffect(() => {
    if (!positionsNo && !positionsYes) {
      setStrategy('Buy')
    }
  }, [positionsYes, positionsNo])

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
      marketType: 'single',
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
    })
    await approveSell()
  }

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
      <VStack mt={'24px'}>
        {positionsYes && (
          <Button
            bg={outcomeChoice === 'yes' ? 'green.500' : 'greenTransparent.100'}
            border='1px solid'
            borderColor={'green.500'}
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
              })
              setDisplayAmount('')
              setOutcomeChoice('yes')
              setCollateralAmount('')
            }}
            borderRadius='8px'
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
                    color='var(--chakra-colors-grey-100)'
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
                  color={outcomeChoice === 'yes' ? 'white' : 'green.500'}
                  justifyContent='space-between'
                  w='full'
                >
                  <HStack gap='8px'>
                    <ThumbsUpIcon width='16px' height='16px' />
                    <Text
                      {...paragraphMedium}
                      color={outcomeChoice === 'yes' ? 'white' : 'green.500'}
                    >
                      Yes
                    </Text>
                  </HStack>
                  <Text
                    {...paragraphMedium}
                    color={outcomeChoice === 'yes' ? 'white' : 'green.500'}
                  >
                    {NumberUtil.toFixed(positionsYes.outcomeTokenAmount, 6)} Contracts
                  </Text>
                </HStack>
                <VStack ml='24px' w='calc(100% - 24px)' gap={isMobile ? '8px' : '4px'}>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text
                        {...paragraphRegular}
                        color={outcomeChoice === 'yes' ? 'white' : 'green.500'}
                      >
                        Per Share
                      </Text>
                    </HStack>
                    <Text
                      {...paragraphRegular}
                      color={outcomeChoice === 'yes' ? 'white' : 'green.500'}
                    >
                      {perShareYes}
                    </Text>
                  </HStack>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text
                        {...paragraphRegular}
                        color={outcomeChoice === 'yes' ? 'white' : 'green.500'}
                      >
                        Total
                      </Text>
                    </HStack>
                    <Text
                      {...paragraphRegular}
                      color={outcomeChoice === 'yes' ? 'white' : 'green.500'}
                    >{`${NumberUtil.toFixed(positionsYes.collateralAmount, 3)} ${
                      market?.collateralToken.symbol
                    }`}</Text>
                  </HStack>
                </VStack>
              </>
            )}
          </Button>
        )}
        {positionsNo && (
          <Button
            bg={outcomeChoice === 'no' ? 'red.500' : 'redTransparent.100'}
            border='1px solid'
            borderColor={'red.500'}
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
              })
              setDisplayAmount('')
              setOutcomeChoice('no')
              setCollateralAmount('')
            }}
            borderRadius='8px'
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
                    color='var(--chakra-colors-grey-100)'
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
                  color={outcomeChoice === 'no' ? 'white' : 'red.500'}
                  justifyContent='space-between'
                  w='full'
                >
                  <HStack gap='8px'>
                    <ThumbsDownIcon width='16px' height='16px' />
                    <Text {...paragraphMedium} color={outcomeChoice === 'no' ? 'white' : 'red.500'}>
                      No
                    </Text>
                  </HStack>
                  <Text {...paragraphMedium} color={outcomeChoice === 'no' ? 'white' : 'red.500'}>
                    {NumberUtil.toFixed(positionsNo.outcomeTokenAmount, 6)} Contracts
                  </Text>
                </HStack>
                <VStack ml='24px' w='calc(100% - 24px)' gap={isMobile ? '8px' : '4px'}>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text
                        {...paragraphRegular}
                        color={outcomeChoice === 'no' ? 'white' : 'red.500'}
                      >
                        Per Share
                      </Text>
                    </HStack>
                    <Text
                      {...paragraphRegular}
                      color={outcomeChoice === 'no' ? 'white' : 'red.500'}
                    >
                      {perShareNo}
                    </Text>
                  </HStack>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text
                        {...paragraphRegular}
                        color={outcomeChoice === 'no' ? 'white' : 'red.500'}
                      >
                        Total
                      </Text>
                    </HStack>
                    <Text
                      {...paragraphRegular}
                      color={outcomeChoice === 'no' ? 'white' : 'red.500'}
                    >{`${NumberUtil.toFixed(positionsNo.collateralAmount, 3)} ${
                      market?.collateralToken.symbol
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
            <Text {...paragraphMedium} color='var(--chakra-colors-grey-500)'>
              Balance
            </Text>
            {sellBalanceLoading ? (
              <Box w='120px'>
                <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
              </Box>
            ) : (
              <Text {...paragraphMedium} color='var(--chakra-colors-grey-500)'>
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
            <SliderTrack bg='var(--chakra-colors-grey-300)'>
              <SliderFilledTrack bg='var(--chakra-colors-grey-800)' />
            </SliderTrack>
            <SliderThumb bg='var(--chakra-colors-grey-500)' />
          </Slider>
          <Stack w={'full'} mt={isMobile ? 0 : '8px'} gap='4px'>
            <HStack justifyContent='space-between'>
              <Text {...paragraphMedium} color='var(--chakra-colors-grey-500)'>
                Enter amount
              </Text>
              {isExceedsBalance && (
                <HStack color='var(--chakra-colors-grey-500)' gap='4px'>
                  <InfoIcon width='16px' height='16px' />
                  <Text {...paragraphMedium} color='var(--chakra-colors-grey-500)'>
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
                  caret-color: var(--chakra-colors-grey-500);
                `}
                type='number'
                inputMode='decimal'
                pattern='[0-9]*'
              />
              <InputRightElement h='16px' top='8px' right={isMobile ? '8px' : '4px'} w='fit'>
                <Text {...paragraphMedium} color='grey.500'>
                  {market?.collateralToken.symbol}
                </Text>
              </InputRightElement>
            </InputGroup>
          </Stack>
          <VStack my='24px' gap={isMobile ? '8px' : '4px'} w='full'>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='var(--chakra-colors-grey-500)'>
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
                  color='var(--chakra-colors-grey-600)'
                >{`${NumberUtil.toFixed(
                  outcomeChoice == 'yes' ? quoteYes?.priceImpact : quoteNo?.priceImpact,
                  2
                )}%`}</Text>
              )}
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='var(--chakra-colors-grey-500)'>
                  ROI
                </Text>
              </HStack>
              {quotesLoading ? (
                <Box w='60px'>
                  <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
                </Box>
              ) : (
                <Text {...paragraphRegular} color='var(--chakra-colors-grey-600)'>
                  {NumberUtil.toFixed(outcomeChoice == 'yes' ? quoteYes?.roi : quoteNo?.roi, 2)}%
                </Text>
              )}
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='var(--chakra-colors-grey-500)'>
                  Total
                </Text>
              </HStack>
              {quotesLoading ? (
                <Box w='120px'>
                  <TradeWidgetSkeleton height={20} type={SkeletonType.WIDGET_GREY} />
                </Box>
              ) : (
                <Text {...paragraphRegular} color='var(--chakra-colors-grey-600)'>
                  {NumberUtil.toFixed(displayAmount, 6)} {token?.symbol}
                </Text>
              )}
            </HStack>
          </VStack>
          {tradeButton}
        </Box>
      )}
    </>
  )
}
