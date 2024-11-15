import {
  Box,
  Button,
  Flex,
  HStack,
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
import ActionButton from '@/app/(markets)/markets/[address]/components/trade-widgets/action-button'
import { useToken } from '@/hooks/use-token'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import InfiniteIcon from '@/resources/icons/infinite-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import InfoIcon from '@/resources/icons/tooltip-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { useBalanceQuery, useBalanceService, useTradingService } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface BuyFormProps {
  market: Market
  setOutcomeIndex: Dispatch<SetStateAction<number>>
  CloseIcon?: unknown
  outcomeTokensPercent?: number[]
  setSelectedMarket?: (market: Market) => void
  marketList?: Market[]
  analyticParams?: { quickBetSource: string; source: string }
}

export function BuyForm({
  market,
  setOutcomeIndex,
  outcomeTokensPercent,
  marketList,
  setSelectedMarket,
  analyticParams,
}: BuyFormProps) {
  const queryClient = useQueryClient()
  const { isOpen: isOpenSelectMarketMenu, onToggle: onToggleSelectMarketMenu } = useDisclosure()

  const [sliderValue, setSliderValue] = useState(0)
  const [showReturnPercent, setShowReturnPercent] = useState(false)
  const [showFeeInValue, setShowFeeInValue] = useState(false)
  const [slippage, setSlippage] = useState('5')
  const [showSlippageDetails, setShowSlippageDetails] = useState(false)

  /**
   * TRADING SERVICE
   */
  const {
    strategy,
    collateralAmount,
    setCollateralAmount,
    quotesYes,
    quotesNo,
    trade,
    resetQuotes,
  } = useTradingService()

  /**
   * BALANCE
   */
  const { setToken, token } = useBalanceService()
  const { balanceOfSmartWallet } = useBalanceQuery()

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

  const balance = useMemo(() => {
    if (strategy === 'Buy') {
      if (balanceOfSmartWallet) {
        return (
          balanceOfSmartWallet.find(
            (balanceItem) => balanceItem.contractAddress === market?.collateralToken.address
          )?.formatted || ''
        )
      }
      return ''
    }
    return ''
  }, [balanceOfSmartWallet, strategy, market])

  const isZeroBalance = !(Number(balance) > 0)

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
    if (token?.symbol === 'USDC') {
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

  const handleSlippageClicked = (value: number) => {
    setSlippage(value.toString())
  }

  const toggleShowSlippageDetails = () => setShowSlippageDetails(!showSlippageDetails)

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

  const resetForm = () => {
    setDisplayAmount('')
    setCollateralAmount('')
    setSliderValue(0)
    resetQuotes()
  }

  const onSlide = useCallback(
    (value: number) => {
      setSliderValue(value)
      if (value == 0 || isZeroBalance) {
        setDisplayAmount('')
        return
      }
      if (value == 100) {
        setDisplayAmount(NumberUtil.toFixed(balance, token?.symbol === 'USDC' ? 1 : 6))
        return
      }
      const amountByPercent = (Number(balance) * value) / 100
      setDisplayAmount(NumberUtil.toFixed(amountByPercent, token?.symbol === 'USDC' ? 1 : 6))
    },
    [sliderValue, balance, isZeroBalance]
  )

  const isExceedsBalance = useMemo(() => {
    return new BigNumber(collateralAmount).isGreaterThan(balance)
  }, [collateralAmount, balance])

  useEffect(() => {
    if (isZeroBalance) {
      setSliderValue(0)
      return
    }
    const percentByAmount = Number(((Number(collateralAmount) / Number(balance)) * 100).toFixed())
    setSliderValue(percentByAmount)
  }, [collateralAmount, balance, isZeroBalance])

  useEffect(() => {
    if (market && collateralToken) {
      setToken(collateralToken)
    }
  }, [market, collateralToken])

  useEffect(() => {
    if (+displayAmount) {
      refetchQuotes()
    }
  }, [market, displayAmount])

  useEffect(() => {
    resetForm()
  }, [strategy, market.address])

  return (
    <>
      {marketList && (
        <>
          <Box mx={isMobile ? '16px' : 0}>
            <Button
              variant='transparentLight'
              w='full'
              justifyContent='space-between'
              mb={isOpenSelectMarketMenu ? '8px' : isMobile ? '24px' : '32px'}
              onClick={onToggleSelectMarketMenu}
              rightIcon={
                <Box
                  transform={`rotate(${isOpenSelectMarketMenu ? '180deg' : 0})`}
                  transition='0.5s'
                  color='white'
                >
                  <ChevronDownIcon width='16px' height='16px' />
                </Box>
              }
            >
              <HStack gap='8px' color='white'>
                <PredictionsIcon />
                <Text {...paragraphMedium} color='white'>
                  {market.title}
                </Text>
              </HStack>
            </Button>
          </Box>
          {isOpenSelectMarketMenu && (
            <VStack
              gap={isMobile ? '16px' : '8px'}
              mb={isMobile ? '16px' : '8px'}
              mx={isMobile ? '16px' : 0}
            >
              {marketList.map((market) => (
                <Button
                  key={market.address}
                  onClick={() => {
                    setSelectedMarket && setSelectedMarket(market)
                    onToggleSelectMarketMenu()
                  }}
                  flexDirection='column'
                  variant='transparentLight'
                  w='full'
                >
                  <HStack mb='8px' w='full'>
                    <HStack justifyContent='space-between' w='full' alignItems='flex-start'>
                      <Text {...paragraphMedium} color='white'>
                        {market.title}
                      </Text>
                      <HStack gap='4px'>
                        <Text {...paragraphMedium} color='white'>
                          {market.prices[0]}%
                        </Text>
                        <Box
                          w='16px'
                          h='16px'
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                        >
                          <Box
                            h='100%'
                            w='100%'
                            borderRadius='100%'
                            bg={`conic-gradient(white 0% ${
                              market.prices[0]
                            }%, var(--chakra-colors-transparent-300) ${
                              market.prices[0] < 1 ? 1 : market.prices[0]
                            }% 100%)`}
                          />
                        </Box>
                      </HStack>
                    </HStack>
                  </HStack>
                  <HStack
                    gap={isMobile ? '8px' : '16px'}
                    flexDirection={isMobile ? 'column' : 'row'}
                    w='full'
                  >
                    <HStack
                      w={isMobile ? '100%' : 'unset'}
                      justifyContent={isMobile ? 'space-between' : 'unset'}
                      color='white'
                    >
                      <LiquidityIcon width={16} height={16} />
                      <Text {...paragraphRegular} color='white'>
                        {NumberUtil.formatThousands(market.liquidityFormatted, 6)}{' '}
                        {market.collateralToken.symbol}
                      </Text>
                    </HStack>
                    <HStack
                      w={isMobile ? '100%' : 'unset'}
                      justifyContent={isMobile ? 'space-between' : 'unset'}
                      color='white'
                    >
                      <VolumeIcon width={16} height={16} />
                      <Text {...paragraphRegular} color='white'>
                        {NumberUtil.formatThousands(market.volumeFormatted, 6)}{' '}
                        {market.collateralToken.symbol}
                      </Text>
                    </HStack>
                  </HStack>
                </Button>
              ))}
            </VStack>
          )}
        </>
      )}
      {!isOpenSelectMarketMenu && (
        <>
          <Flex justifyContent='space-between' p={isMobile ? '0 16px' : 0}>
            <Text {...paragraphMedium} color='white'>
              Balance
            </Text>
            <Text {...paragraphMedium} color='white'>
              {NumberUtil.formatThousands(balance, token?.symbol === 'USDC' ? 1 : 6)}{' '}
              {token?.symbol}
            </Text>
          </Flex>
          <Box px={isMobile ? '16px' : 0}>
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
              <SliderTrack bg='rgba(255, 255, 255, 0.2)'>
                <SliderFilledTrack bg='white' />
              </SliderTrack>
              <SliderThumb bg='white' w='8px' h='8px' />
            </Slider>
          </Box>

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

          <Stack w={'full'} mt={isMobile ? 0 : '8px'} gap='4px' px={isMobile ? '16px' : 0}>
            <HStack justifyContent='space-between'>
              <Text {...paragraphMedium} color='white'>
                Enter amount
              </Text>
              {isExceedsBalance && (
                <HStack color='white' gap='4px'>
                  <InfoIcon width='16px' height='16px' />
                  <Text {...paragraphMedium} color='white'>
                    Not enough funds
                  </Text>
                </HStack>
              )}
            </HStack>
            <Stack
              w={'full'}
              borderRadius='2px'
              border={'1px solid grey.50'}
              borderColor={isExceedsBalance ? 'red' : 'border'}
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
              cursor='pointer'
              onClick={toggleShowSlippageDetails}
            >
              <Text {...paragraphRegular} color='white'>
                Slippage Tolerance{' '}
                {slippage === '100' ? 'Infinite' : !slippage ? '0%' : `${slippage}%`}
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
                <InputGroup flex={3}>
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
                    flex={2}
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
          </Stack>
          <VStack mt='16px' overflowX='hidden' px={isMobile ? '16px' : 0}>
            <ActionButton
              onClick={async () => {
                setOutcomeIndex(0)
                await trade(0, slippage)
              }}
              isExceedsBalance={isExceedsBalance}
              disabled={!collateralAmount}
              market={market}
              quote={quotesYes}
              amount={collateralAmount}
              option='Yes'
              price={outcomeTokensPercent?.[0]}
              decimals={collateralToken?.decimals}
              marketType={!!marketList?.length ? 'group' : 'single'}
              showReturnPercent={showReturnPercent}
              setShowReturnPercent={setShowReturnPercent}
              showFeeInValue={showFeeInValue}
              setShowFeeInValue={setShowFeeInValue}
              resetForm={resetForm}
              analyticParams={analyticParams}
            />
            <ActionButton
              disabled={!collateralAmount}
              onClick={async () => {
                setOutcomeIndex(1)
                await trade(1, slippage)
              }}
              isExceedsBalance={isExceedsBalance}
              market={market}
              quote={quotesNo}
              amount={collateralAmount}
              option='No'
              price={outcomeTokensPercent?.[1]}
              decimals={collateralToken?.decimals}
              marketType={!!marketList?.length ? 'group' : 'single'}
              showReturnPercent={showReturnPercent}
              setShowReturnPercent={setShowReturnPercent}
              showFeeInValue={showFeeInValue}
              setShowFeeInValue={setShowFeeInValue}
              resetForm={resetForm}
              analyticParams={analyticParams}
            />
          </VStack>
        </>
      )}
    </>
  )
}
